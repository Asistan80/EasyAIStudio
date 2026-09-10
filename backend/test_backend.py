"""
==========================================================
Easy AI Studio
File    : test_backend.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from services.bootstrap import bootstrap
from services.service_registry import service_registry
from services.provider_manager import provider_manager
from services.model_manager import model_manager
from services.cache_manager import cache_manager
from services.prompt_manager import prompt_manager
from services.workflow_manager import workflow_manager
from services.export_manager import export_manager
from services.download_manager import download_manager
from services.ai_engine import ai_engine
from services.image_engine import image_engine
from services.video_engine import video_engine


def print_result(name, result):

    status = "OK" if result else "FAILED"

    print(f"[{status}] {name}")


def main():

    print("=" * 60)
    print("Easy AI Studio Backend Test")
    print("=" * 60)

    bootstrap()

    print_result(

        "Service Registry",

        service_registry.count() > 0

    )

    print_result(

        "Providers",

        provider_manager.count() > 0

    )

    print_result(

        "Models",

        model_manager.count() > 0

    )

    cache_manager.set(

        "hello",

        "world"

    )

    print_result(

        "Cache",

        cache_manager.get("hello") == "world"

    )

    prompt = prompt_manager.create(

        "Test Prompt",

        "Hello AI"

    )

    print_result(

        "Prompt",

        prompt_manager.count() == 1

    )

    workflow = workflow_manager.create(

        "Workflow Test"

    )

    print_result(

        "Workflow",

        workflow is not None

    )

    export = export_manager.create(

        "test.txt",

        "text"

    )

    print_result(

        "Export",

        export is not None

    )

    download = download_manager.add(

        "https://example.com/file.zip",

        "downloads/file.zip"

    )

    print_result(

        "Download",

        download is not None

    )

    ai = ai_engine.generate(

        "openai",

        "gpt-5.5",

        "Hello"

    )

    print_result(

        "AI Engine",

        ai["success"]

    )

    image = image_engine.generate(

        "openai",

        "gpt-5.5",

        "A fantasy castle"

    )

    print_result(

        "Image Engine",

        image["success"]

    )

    video = video_engine.generate(

        "openai",

        "gpt-5.5",

        "Flying over mountains"

    )

    print_result(

        "Video Engine",

        video["success"]

    )

    print()

    print("=" * 60)
    print("Backend tests completed.")
    print("=" * 60)


if __name__ == "__main__":

    main()