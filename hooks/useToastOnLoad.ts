import { useEffect, useRef } from "react";
import { useToast, ToastId, UseToastOptions } from "@chakra-ui/react";

const useToastOnLoad = ({
    title,
    description,
    status,
    updateDeps
}: {
    title: string,
    description?: string
    status: "info" | "warning" | "success" | "error",
    updateDeps?: any
}): void => {
    const toast = useToast();
    const toastId = useRef<ToastId | null>();

    useEffect(() => {
        if (!description)
            return;

        const toastOptions: UseToastOptions = {
            title,
            description,
            status,
            duration: null,
            isClosable: true,
            onCloseComplete: () => {
                toastId.current = null
            }
        };

        if (toastId.current)
            return toast.update(toastId.current, toastOptions);
        toastId.current = toast(toastOptions);
    }, [toast, title, description, status, updateDeps]);
}

export default useToastOnLoad;
