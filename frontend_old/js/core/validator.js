/*
==========================================================
Easy AI Studio
File    : frontend/js/core/validator.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class Validator {

    required(

        value

    ) {

        return (

            value !== null &&

            value !== undefined &&

            value !== ""

        );

    }

    email(

        value

    ) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/

            .test(

                value

            );

    }

    url(

        value

    ) {

        try {

            new URL(

                value

            );

            return true;

        }

        catch {

            return false;

        }

    }

    number(

        value

    ) {

        return (

            !isNaN(

                value

            ) &&

            value !== ""

        );

    }

    integer(

        value

    ) {

        return Number.isInteger(

            Number(

                value

            )

        );

    }

    minLength(

        value,

        length

    ) {

        return (

            String(

                value

            ).length >= length

        );

    }

    maxLength(

        value,

        length

    ) {

        return (

            String(

                value

            ).length <= length

        );

    }

    range(

        value,

        min,

        max

    ) {

        return (

            Number(

                value

            ) >= min &&

            Number(

                value

            ) <= max

        );

    }

    equals(

        first,

        second

    ) {

        return first === second;

    }

    json(

        value

    ) {

        try {

            JSON.parse(

                value

            );

            return true;

        }

        catch {

            return false;

        }

    }

    validate(

        value,

        rules = []

    ) {

        for (

            const rule of rules

        ) {

            if (

                typeof this[rule.name] !==

                "function"

            ) {

                continue;

            }

            const valid =

                this[rule.name](

                    value,

                    ...(rule.args || [])

                );

            if (

                !valid

            ) {

                return false;

            }

        }

        return true;

    }

}

const ValidatorService =

    new Validator();

window.Validator =

    ValidatorService;