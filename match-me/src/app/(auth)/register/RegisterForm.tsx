"use client";

import {
    RegisterSchema
} from "@/lib/schemas/RegisterSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Input
} from "@heroui/react";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { GiPadlock } from "react-icons/gi";

export default function RegisterForm() {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting }
    } = useForm<RegisterSchema>({
        resolver: zodResolver(RegisterSchema),
        mode: "onTouched"
    });

    const onSubmit = (data: RegisterSchema) => {
        console.log(data);
    };

    return (
        <Card className="w-3/5 mx-auto">
            <CardHeader className="flex flex-col items-center justify-center">
            </CardHeader>
            <CardBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <Input
                            defaultValue=""
                            label="Name"
                            variant="bordered"
                            {...register("name")}
                            isInvalid={!!errors.name}
                            errorMessage={errors.name?.message as string}
                        />
                        <Input
                            defaultValue=""
                            label="Email"
                            variant="bordered"
                            {...register("email")}
                            isInvalid={!!errors.email}
                            errorMessage={errors.email?.message as string}
                        />
                        <Input
                            defaultValue=""
                            label="Password"
                            variant="bordered"
                            type="password"
                            {...register("password")}
                            isInvalid={!!errors.password}
                            errorMessage={errors.password?.message as string}
                        />
                        <Button
                            isLoading={isSubmitting}
                            isDisabled={!isValid}
                            fullWidth
                            color="default"
                            type="submit"
                        >
                            Register
                        </Button>
                    </div>
                </form>
            </CardBody>
        </Card>
    )
}