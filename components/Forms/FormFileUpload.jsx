"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Controller, useFormContext } from "react-hook-form";
import { FiUploadCloud, FiFile, FiX, FiLoader, FiCheck } from "react-icons/fi";
import {
    useSingleFileUploadMutation,
    useMultipleFileUploadMutation
} from "@/store/attachment";

const FormFileUpload = ({
    name,
    label,
    required = false,
    multiple = false,
    accept = "*",
    autoUpload = true,
    valueKey = null,

    wrapperClass = "",
    labelClass = "",
}) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadErrors, setUploadErrors] = useState([]);
    const [singleUpload] = useSingleFileUploadMutation();
    const [multipleUpload] = useMultipleFileUploadMutation();

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return singleUpload(formData).unwrap();
    };

    const uploadFiles = async (files) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        return multipleUpload(formData).unwrap();
    };

    return (
        <div className={`w-full ${wrapperClass}`}>
            {label && (
                <label
                    className={`mb-2 block text-sm font-medium text-gray-800 ${labelClass}`}
                >
                    {label}
                    {required && <span className="ml-1 text-red-600">*</span>}
                </label>
            )}

            <Controller
                name={name}
                control={control}
                rules={{
                    required: required
                        ? `${label || name} is required`
                        : false,
                }}
                defaultValue={multiple ? [] : null}
                render={({ field }) => {
                    const fileList = multiple
                        ? field.value || []
                        : field.value
                            ? [field.value]
                            : [];

                    const isFileObject = (v) => v instanceof File || (v && v.name && v.size !== undefined);

                    const handleFiles = async (files) => {
                        const selectedFiles = Array.from(files);
                        if (selectedFiles.length === 0) return;

                        setUploadErrors([]);

                        if (!autoUpload) {
                            field.onChange(
                                multiple
                                    ? selectedFiles
                                    : selectedFiles[0] || null
                            );
                            return;
                        }

                        setUploading(true);

                        try {
                            if (!multiple) {
                                const result = await uploadFile(selectedFiles[0]);
                                const raw = result?.data || result;
                                field.onChange(valueKey ? raw?.[valueKey] : raw);
                            } else {
                                const result = await uploadFiles(selectedFiles);
                                const raw = result?.data || result;
                                const mapped = valueKey
                                    ? (raw || []).map((item) => item?.[valueKey])
                                    : raw;
                                field.onChange(mapped);
                            }
                        } catch (err) {
                            const msg = err?.data?.message || "Upload failed. Please try again.";
                            setUploadErrors([msg]);
                        } finally {
                            setUploading(false);
                        }

                        if (inputRef.current) {
                            inputRef.current.value = "";
                        }
                    };

                    const removeFile = (index) => {
                        if (!multiple) {
                            field.onChange(null);
                            return;
                        }
                        const updated = [...fileList];
                        updated.splice(index, 1);
                        field.onChange(updated);
                    };

                    const getDisplayName = (item) => {
                        if (isFileObject(item)) return item.name;
                        if (typeof item === "string") return item.split("/").pop() || item;
                        if (item?.originalName) return item.originalName;
                        if (item?.fileName) return item.fileName;
                        if (item?.url) return item.url.split("/").pop() || item.url;
                        if (item?.path) return item.path.split("/").pop() || item.path;
                        return "Uploaded file";
                    };

                    const getFileUrl = (item) => {
                        if (typeof item === "string") return item;
                        if (item?.url) return item.url;
                        if (item?.path) return item.path;
                        return null;
                    };

                    return (
                        <>
                            <div
                                onClick={() => !uploading && inputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (!uploading) handleFiles(e.dataTransfer.files);
                                }}
                                className={`
                  cursor-pointer rounded-xl border-2 border-dashed
                  p-8 text-center transition-all
                  hover:border-blue-500 hover:bg-gray-50
                  ${uploading ? "pointer-events-none opacity-60" : ""}
                  ${errors[name] ? "border-red-500" : "border-gray-300"}
                `}
                            >
                                {uploading ? (
                                    <FiLoader
                                        size={40}
                                        className="mx-auto mb-3 animate-spin text-blue-500"
                                    />
                                ) : (
                                    <FiUploadCloud
                                        size={40}
                                        className="mx-auto mb-3 text-gray-400"
                                    />
                                )}

                                <p className="font-medium text-gray-700">
                                    {uploading
                                        ? "Uploading..."
                                        : "Click to upload or drag files here"
                                    }
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    Allowed: {accept}
                                </p>

                                <input
                                    ref={inputRef}
                                    type="file"
                                    hidden
                                    multiple={multiple}
                                    accept={accept}
                                    disabled={uploading}
                                    onChange={(e) =>
                                        handleFiles(e.target.files)
                                    }
                                />
                            </div>

                            {uploadErrors.length > 0 && (
                                <div className="mt-3 space-y-1">
                                    {uploadErrors.map((msg, i) => (
                                        <p key={i} className="text-sm text-red-500">
                                            {msg}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {fileList.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {fileList.map((item, index) => {
                                        const url = getFileUrl(item);
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {url ? (
                                                        <Image
                                                            src={url}
                                                            alt=""
                                                            width={40}
                                                            height={40}
                                                            className="h-10 w-10 rounded object-cover border"
                                                            unoptimized
                                                        />
                                                    ) : isFileObject(item) ? (
                                                        <FiFile className="shrink-0 text-gray-500" />
                                                    ) : (
                                                        <FiCheck className="shrink-0 text-green-500" />
                                                    )}

                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {getDisplayName(item)}
                                                        </p>
                                                        {isFileObject(item) && (
                                                            <p className="text-xs text-gray-500">
                                                                {(item.size / 1024).toFixed(1)} KB
                                                            </p>
                                                        )}
                                                        {url && (
                                                            <p className="text-xs text-blue-500 truncate">
                                                                {url}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="shrink-0 ml-2 text-red-500 hover:text-red-700"
                                                >
                                                    <FiX size={18} className="hover:cursor-pointer" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {errors[name] && (
                                <p className="mt-2 text-sm text-red-500">
                                    {errors[name]?.message}
                                </p>
                            )}
                        </>
                    );
                }}
            />
        </div>
    );
};

export default FormFileUpload;
