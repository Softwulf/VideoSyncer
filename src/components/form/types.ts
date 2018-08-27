import { FormikProps } from 'formik';

export type VInputProps<InputProps, FormValues> =  {
    formik: FormikProps<FormValues>
    fieldName: keyof FormValues & string
    label: string
} & InputProps