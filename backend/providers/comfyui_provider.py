"""
==========================================================
Easy AI Studio
File    : backend/providers/comfyui_provider.py
Version : 6.0.0
==========================================================
"""

from __future__ import annotations

import asyncio
import json
import random
import time
from copy import deepcopy
from pathlib import Path
from typing import Any

import httpx

from config.settings import settings
from providers.base_provider import BaseProvider
from schemas.image import ImageRequest, ImageResponse
from services.gallery_service import gallery_service


class ComfyUIProvider(BaseProvider):

    provider_name = "ComfyUI"

    def __init__(self) -> None:

        self.base_url = (
            f"http://{settings.COMFYUI_HOST}:"
            f"{settings.COMFYUI_PORT}"
        )

        self.timeout = settings.COMFYUI_TIMEOUT

        self.workflow_path = (
            settings.COMFYUI_WORKFLOW
        )

        self.video_workflow_path = (
            settings.COMFYUI_VIDEO_WORKFLOW
        )

        self.client_id = (
            f"easy-ai-{int(time.time())}"
        )

        self.workflow: dict[str, Any] = {}

        self.video_workflow: dict[str, Any] = {}

        self._initialized = False

    # ======================================================
    # Provider Lifecycle
    # ======================================================

    async def initialize(self) -> None:

        if self._initialized:
            return

        await self._load_workflow()

        await self._load_video_workflow()

        self._initialized = True

    async def health(self) -> bool:

        try:

            async with httpx.AsyncClient(
                timeout=10
            ) as client:

                response = await client.get(
                    f"{self.base_url}/system_stats"
                )

                return (
                    response.status_code == 200
                )

        except Exception:

            return False

    # ======================================================
    # Workflow
    # ======================================================

    async def _load_workflow(self) -> None:

        if not self.workflow_path.exists():

            raise FileNotFoundError(
                f"Workflow bulunamadı: "
                f"{self.workflow_path}"
            )

        with open(
            self.workflow_path,
            "r",
            encoding="utf-8",
        ) as file:

            self.workflow = json.load(file)

    async def _load_video_workflow(self) -> None:

        if not self.video_workflow_path.exists():

            raise FileNotFoundError(
                f"Video workflow bulunamadı: "
                f"{self.video_workflow_path}"
            )

        with open(
            self.video_workflow_path,
            "r",
            encoding="utf-8",
        ) as file:

            self.video_workflow = json.load(file)

    # ======================================================
    # Image Workflow Preparation
    # ======================================================

    def _prepare_workflow(
        self,
        request: ImageRequest,
    ) -> dict[str, Any]:

        workflow = deepcopy(
            self.workflow
        )

        #
        # Positive Prompt
        #

        if "67" in workflow:

            workflow["67"]["inputs"][
                "text"
            ] = request.prompt

        #
        # Negative Prompt
        #

        if "71" in workflow:

            workflow["71"]["inputs"][
                "text"
            ] = (
                request.negative_prompt
                or ""
            )

        #
        # Size
        #

        if "68" in workflow:

            workflow["68"]["inputs"][
                "width"
            ] = request.width

            workflow["68"]["inputs"][
                "height"
            ] = request.height

        #
        # Seed
        #

        if "70" in workflow:

            seed = request.seed

            if seed < 0:

                seed = random.randint(
                    0,
                    2**32 - 1
                )

            workflow["70"]["inputs"][
                "seed"
            ] = seed

        #
        # Steps
        #

        if "70" in workflow:

            workflow["70"]["inputs"][
                "steps"
            ] = request.steps

        #
        # CFG
        #

        if "70" in workflow:

            workflow["70"]["inputs"][
                "cfg"
            ] = request.cfg

        return workflow

    # ======================================================
    # Video Workflow Preparation
    # ======================================================

    def _prepare_video_workflow(
        self,
        request: dict[str, Any],
    ) -> dict[str, Any]:

        workflow = deepcopy(
            self.video_workflow
        )

        #
        # Prompt
        #

        prompt = str(
            request.get(
                "prompt",
                ""
            )
        )

        if "6" in workflow:

            workflow["6"]["inputs"][
                "text"
            ] = prompt

        #
        # Negative Prompt
        #

        negative_prompt = str(
            request.get(
                "negative_prompt",
                ""
            )
        )

        if "7" in workflow:

            workflow["7"]["inputs"][
                "text"
            ] = negative_prompt

        #
        # Resolution
        #
        # Wan workflow currently uses:
        # 832 x 480
        #

        width = int(
            request.get(
                "width",
                832
            )
        )

        height = int(
            request.get(
                "height",
                480
            )
        )

        if "40" in workflow:

            workflow["40"]["inputs"][
                "width"
            ] = width

            workflow["40"]["inputs"][
                "height"
            ] = height

        #
        # Frames
        #
        # The workflow uses 33 frames by default.
        #

        frame_count = request.get(
            "frames"
        )

        if frame_count is None:

            duration = float(
                request.get(
                    "duration",
                    2
                )
            )

            fps = int(
                request.get(
                    "fps",
                    16
                )
            )

            frame_count = max(
                1,
                int(
                    duration * fps
                ) + 1
            )

        frame_count = int(
            frame_count
        )

        if "40" in workflow:

            workflow["40"]["inputs"][
                "length"
            ] = frame_count

        #
        # Batch Size
        #

        if "40" in workflow:

            workflow["40"]["inputs"][
                "batch_size"
            ] = 1

        #
        # Seed
        #

        seed = request.get(
            "seed",
            -1
        )

        try:

            seed = int(seed)

        except (
            TypeError,
            ValueError,
        ):

            seed = -1

        if seed < 0:

            seed = random.randint(
                0,
                2**63 - 1
            )

        if "3" in workflow:

            workflow["3"]["inputs"][
                "seed"
            ] = seed

        #
        # Steps
        #

        steps = request.get(
            "steps"
        )

        if steps is not None:

            try:

                workflow["3"]["inputs"][
                    "steps"
                ] = int(steps)

            except (
                TypeError,
                ValueError,
            ):

                pass

        #
        # CFG
        #

        cfg = request.get(
            "cfg"
        )

        if cfg is not None:

            try:

                workflow["3"]["inputs"][
                    "cfg"
                ] = float(cfg)

            except (
                TypeError,
                ValueError,
            ):

                pass

        #
        # FPS
        #

        fps = request.get(
            "fps",
            16
        )

        try:

            fps = int(fps)

        except (
            TypeError,
            ValueError,
        ):

            fps = 16

        fps = max(
            1,
            fps
        )

        if "49" in workflow:

            workflow["49"]["inputs"][
                "fps"
            ] = fps

        #
        # Output Prefix
        #

        if "50" in workflow:

            workflow["50"]["inputs"][
                "filename_prefix"
            ] = "video/EasyAIStudio"

        return workflow

    # ======================================================
    # ComfyUI API
    # ======================================================

    async def _queue_prompt(
        self,
        workflow: dict[str, Any],
    ) -> str:

        payload = {
            "prompt": workflow,
            "client_id": self.client_id,
        }

        async with httpx.AsyncClient(
            timeout=30
        ) as client:

            response = await client.post(
                f"{self.base_url}/prompt",
                json=payload,
            )

            response.raise_for_status()

            data = response.json()

            return data["prompt_id"]

    async def _wait_result(
        self,
        prompt_id: str,
    ) -> dict[str, Any]:

        start = time.time()

        while True:

            async with httpx.AsyncClient(
                timeout=30
            ) as client:

                response = await client.get(
                    f"{self.base_url}/history/{prompt_id}"
                )

                response.raise_for_status()

                data = response.json()

            if prompt_id in data:

                return data[prompt_id]

            if (
                time.time() - start
                > self.timeout
            ):

                raise TimeoutError(
                    "ComfyUI zaman aşımına uğradı."
                )

            await asyncio.sleep(1)

    # ======================================================
    # Image Extraction
    # ======================================================

    def _extract_image(
        self,
        result: dict[str, Any],
    ) -> str:

        outputs = result.get(
            "outputs",
            {}
        )

        for node in outputs.values():

            images = node.get(
                "images",
                []
            )

            if images:

                image = images[0]

                filename = image.get(
                    "filename"
                )

                subfolder = image.get(
                    "subfolder",
                    ""
                )

                image_type = image.get(
                    "type",
                    "output"
                )

                return (
                    f"{self.base_url}/view?"
                    f"filename={filename}"
                    f"&subfolder={subfolder}"
                    f"&type={image_type}"
                )

        return ""

# ======================================================
# Video Extraction
# ======================================================

    def _extract_video(
        self,
        result: dict[str, Any],
    ) -> str:

        outputs = result.get(
            "outputs",
            {}
        )

        for node in outputs.values():

            #
            # SaveVideo / VHS output
            #

            images = node.get(
                "images",
                []
            )

            for image in images:

                filename = image.get(
                    "filename"
                )

                if not filename:
                    continue

                subfolder = image.get(
                    "subfolder",
                    ""
                )

                image_type = image.get(
                    "type",
                    "output"
                )

                return (
                    f"{self.base_url}/view?"
                    f"filename={filename}"
                    f"&subfolder={subfolder}"
                    f"&type={image_type}"
                )

            #
            # Compatibility: gifs
            #

            gifs = node.get(
                "gifs",
                []
            )

            for gif in gifs:

                filename = gif.get(
                    "filename"
                )

                if not filename:
                    continue

                subfolder = gif.get(
                    "subfolder",
                    ""
                )

                gif_type = gif.get(
                    "type",
                    "output"
                )

                return (
                    f"{self.base_url}/view?"
                    f"filename={filename}"
                    f"&subfolder={subfolder}"
                    f"&type={gif_type}"
                )

            #
            # Compatibility: videos
            #

            videos = node.get(
                "videos",
                []
            )

            for video in videos:

                filename = video.get(
                    "filename"
                )

                if not filename:
                    continue

                subfolder = video.get(
                    "subfolder",
                    ""
                )

                video_type = video.get(
                    "type",
                    "output"
                )

                return (
                    f"{self.base_url}/view?"
                    f"filename={filename}"
                    f"&subfolder={subfolder}"
                    f"&type={video_type}"
                )

        return ""

    # ======================================================
    # Image Generation
    # ======================================================

    async def generate_image(
        self,
        request: ImageRequest,
    ) -> ImageResponse:

        try:

            workflow = (
                self._prepare_workflow(
                    request
                )
            )

            prompt_id = (
                await self._queue_prompt(
                    workflow
                )
            )

            result = (
                await self._wait_result(
                    prompt_id
                )
            )

            image = self._extract_image(
                result
            )

            if image:

                saved_image = (
                    await gallery_service.save_from_comfy(
                        image,
                        metadata={
                            "prompt": request.prompt,
                            "negative_prompt": request.negative_prompt,
                            "seed": request.seed,
                            "model": request.model,
                            "sampler": request.sampler,
                            "scheduler": request.scheduler,
                            "cfg": request.cfg,
                            "steps": request.steps,
                            "width": request.width,
                            "height": request.height,
                            "provider": self.provider_name,
                        },
                    )
                )

            else:

                saved_image = ""

            return ImageResponse(

                success=bool(saved_image),

                provider=self.provider_name,

                image=saved_image,

                prompt=request.prompt,

                negative_prompt=request.negative_prompt,

                model=request.model,

                width=request.width,

                height=request.height,

                steps=request.steps,

                cfg=request.cfg,

                seed=request.seed,

            )

        except Exception:

            return ImageResponse(

                success=False,

                provider=self.provider_name,

                image="",

                prompt=request.prompt,

            )

# ======================================================
# Video Generation
# ======================================================

    async def generate_video(
        self,
        request: dict,
    ) -> dict:

        try:

            if not self.video_workflow:

                await self._load_video_workflow()

            workflow = (
                self._prepare_video_workflow(
                    request
                )
            )

            prompt_id = (
                await self._queue_prompt(
                    workflow
                )
            )

            result = (
                await self._wait_result(
                    prompt_id
                )
            )

            output = self._extract_video(
                result
            )

            if not output:

                return {
                    "success": False,
                    "provider": self.provider_name,
                    "prompt_id": prompt_id,
                    "status": "failed",
                    "output": "",
                    "message": (
                        "ComfyUI üretimi tamamladı "
                        "ancak video çıktısı bulunamadı."
                    ),
                }

            #
            # Extract filename from ComfyUI URL
            #

            filename = ""

            try:

                filename = (
                    output.split(
                        "filename=",
                        1
                    )[1]
                    .split(
                        "&",
                        1
                    )[0]
                )

            except Exception:

                filename = ""

            if not filename:

                return {
                    "success": False,
                    "provider": self.provider_name,
                    "prompt_id": prompt_id,
                    "status": "failed",
                    "output": "",
                    "message": (
                        "Video dosya adı alınamadı."
                    ),
                }

            #
            # Make a safe local filename
            #

            safe_filename = (
                filename
                .replace(
                    "/",
                    "_"
                )
                .replace(
                    "\\",
                    "_"
                )
                .replace(
                    ":",
                    "_"
                )
            )

            export_path = (
                settings.EXPORTS_DIR
                / safe_filename
            )

            #
            # Download video from ComfyUI
            #

            async with httpx.AsyncClient(
                timeout=self.timeout
            ) as client:

                response = await client.get(
                    output
                )

                response.raise_for_status()

                export_path.write_bytes(
                    response.content
                )

            #
            # Return Easy AI Studio output
            #

            output_url = (
                f"/exports/{safe_filename}"
            )

            return {
                "success": True,
                "provider": self.provider_name,
                "prompt_id": prompt_id,
                "status": "completed",
                "output": output_url,
                "comfyui_output": output,
                "filename": safe_filename,
                "path": str(export_path),
                "message": (
                    "Video generated successfully."
                ),
            }

        except Exception as exc:

            return {
                "success": False,
                "provider": self.provider_name,
                "status": "failed",
                "output": "",
                "message": str(exc),
            }

    async def generate_text(
        self,
        request: dict,
    ) -> dict:

        return {
            "success": False,
            "provider": self.provider_name,
            "message": "Text generation is not implemented yet.",
        }

    # ======================================================
    # Models
    # ======================================================

    async def models(
        self,
    ) -> list[dict]:

        return [
            {
                "name": "z_image_turbo_bf16",
                "type": "image",
                "provider": self.provider_name,
            },
            {
                "name": "wan2.1_t2v_1.3B",
                "type": "video",
                "provider": self.provider_name,
            },
        ]

    # ======================================================
    # Utility
    # ======================================================

    async def interrupt(
        self,
    ) -> bool:

        try:

            async with httpx.AsyncClient(
                timeout=10
            ) as client:

                response = await client.post(
                    f"{self.base_url}/interrupt"
                )

                return (
                    response.status_code == 200
                )

        except Exception:

            return False

    def __repr__(
        self,
    ) -> str:

        return (
            f"<ComfyUIProvider "
            f"url={self.base_url}>"
        )