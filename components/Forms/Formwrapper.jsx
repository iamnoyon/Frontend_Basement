// components/form/FormWrapper.jsx
"use client";

import { FormProvider } from "react-hook-form";

const Formwrapper = ({
  methods,
  onSubmit,
  children,
  className = "",
}) => {
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={className}
      >
        {children}
      </form>
    </FormProvider>
  );
};

export default Formwrapper;