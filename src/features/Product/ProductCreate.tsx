"use client";
import { Button, Card, CardContent, CardHeader, Grid } from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormTextField from "@/components/ui/FormTextField/FormTextField";
import CategoryDropdown from "@/components/common/CategoryDropdown/CtaegoryDropdown";
import { createProduct } from "@/services/product/productService";
import CustomSnackbar, {
  severity,
} from "@/components/ui/CustomSnackbar/CustomSnackbar";
import { useState } from "react";
import FormSelect from "@/components/ui/FomSelect/FormSelect";
const UNITS = ["kg", "gm", "litre", "ml", "piece"];
export const productSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Product name must be at least 3 characters long" }),
  description: z.string().optional(),
  unit: z.enum(["kg", "gm", "litre", "ml", "piece"]),
  price: z
    .number()
    .positive()
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/)),
  category: z.object({
    name: z.string(),
    description: z.string().optional(),
    _id: z.string(),
  }),
  brand: z.object({
    name: z.string(),
    description: z.string().optional(),
    _id: z.string(),
  }),
});
type IFormInput = z.infer<typeof productSchema>;

const CreateProductForm = () => {
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setMessage] = useState("");
  const [severity, setSeverity] = useState<severity>("success");

  const handleClose = () => {
    snackbarMessage !== "" && setMessage("");
    setSeverity("success");
    setOpen(false);
  };
  const {
    control,
    handleSubmit,
    formState: { errors, ...restFormState },
    setValue,
    reset,
  } = useForm<IFormInput>({
    defaultValues: {
      name: "",
      description: "",
      category: {},
      brand: {},
      unit: "litre",
      price: 0,
    },
    resolver: zodResolver(productSchema),
  });

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    console.log("formValues", data);
    try {
      const response = await createProduct({
        name: data.name,
        description: data.description || "",
        unit: data.unit,
        price: data.price,
        category: data.category._id,
        image: "",
        brand: data.brand._id,
      });
      console.log("response", response);
      if (response.statusCode === 200) {
        openSnackbar("Product created successfully", "success");
        reset();
      }
    } catch (error: any) {
      if (error) {
        openSnackbar(error.errors.message, "error");
      } else {
        console.log("An unexpected error occurred. Please try again later.");
      }
    }
  };

  const openSnackbar = (message: string, severity: severity) => {
    setMessage(message);
    setSeverity(severity);
    setOpen(true);
  };
  console.log("errors", errors);
  return (
    <>
      <Card>
        <CardHeader title="Create Product" />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item md={2}>
                <FormTextField
                  name={"name"}
                  control={control}
                  label={"Product Name"}
                />
              </Grid>
              <Grid item md={2}>
                <FormSelect
                  control={control}
                  options={[
                    { value: "kg", label: "kg" },
                    { value: "gm", label: "gm" },
                    { value: "litre", label: "litre" },
                    { value: "ml", label: "ml" },
                    { value: "piece", label: "piece" },
                  ]}
                  name="unit"
                  label="Unit"
                />
              </Grid>
              <Grid item md={2}>
                <FormTextField
                  type="number"
                  name={"price"}
                  control={control}
                  label={"Price"}
                />
              </Grid>
              <Grid item md={3}>
                <CategoryDropdown
                  setValue={setValue}
                  type="category"
                  control={control}
                  name="category"
                />
              </Grid>
              <Grid item md={3}>
                <CategoryDropdown
                  setValue={setValue}
                  type="brand"
                  control={control}
                  name="brand"
                />
              </Grid>
              <Grid item lg={12}>
                <FormTextField
                  name={"description"}
                  control={control}
                  label={"Description"}
                  multiline={true}
                  rows={4}
                />
              </Grid>
            </Grid>
            <Grid className="flex justify-center mt-4">
              <Grid item md={12}>
                <Button
                  variant="contained"
                  type="submit"
                  color="primary"
                  className="text-white py-2 px-4 my-4 rounded"
                  size="medium"
                  data-testId="create-product-button"
                >
                  Create Product
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      {open && (
        <CustomSnackbar
          message={snackbarMessage}
          severity={severity}
          open={open}
          onClose={handleClose}
          action={<Button onClick={handleClose}>Dismiss</Button>}
        />
      )}
    </>
  );
};

export default CreateProductForm;
