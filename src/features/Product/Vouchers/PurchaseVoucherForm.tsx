"use client";
import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Button,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControl,
} from "@mui/material";
import { z } from "zod";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ProductDropdown from "../ProductDropdown/ProductDropdown"; // Import the ProductDropdown component
import LookupDropdown from "../LookupDropdown/LookupDropdown";
import { lookups } from "@/services/product/lookupService";
import SupplierCreationForm from "../LedgerDropdown/SupplierCreate";
import useVoucher from "@/hooks/useVouchers";
import useLedger from "@/hooks/useLedgers";
import BatchSelect from "./BatchSelect";

// Zod schema
const purchaseVoucherSchema = z.object({
  date: z.string().nonempty("Date is required"),
  supplier: z.object({
    name: z.string().nonempty("Supplier name is required"),
    _id: z.string().nonempty("Supplier ID is required"),
  }),
  invoiceNumber: z.union([z.string(), z.number()]),
  items: z.array(
    z.object({
      itemName: z
        .object({
          description: z.string().nonempty("Item description is required"),
          name: z.string().nonempty("Item name is required"),
          _id: z.string().nonempty("Item ID is required"),
          details: z.any(),
        })
        .optional(),
      quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
      rate: z.coerce.number().min(0.01, "Rate must be greater than 0"),
      gst: z.coerce.number().min(0, "GST must be 0 or greater"),
      amount: z.number().optional(),
      gstAmount: z.number().optional(),
      batch: z.string().min(1, "Batch is required"),
    }),
  ),
  totalAmount: z.number(),
  totalGST: z.number(),
  cgst: z.number(),
  sgst: z.number(),
  applyGST: z.boolean(),
});

const PurchaseVoucherForm = () => {
  const { getNextVoucherNumber } = useVoucher();
  const { getLedger } = useLedger();
  const ledger = getLedger("Purchase");
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(purchaseVoucherSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      supplier: "",
      invoiceNumber: "INV-10001" || "",
      items: [
        {
          itemName: "",
          quantity: 1,
          rate: 0,
          gst: 18 || 0,
          amount: 0,
          gstAmount: 0,
          batch: "",
        },
      ],
      totalAmount: 0,
      totalGST: 0,
      cgst: 0,
      sgst: 0,
      applyGST: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");
  const applyGST = watch("applyGST");

  React.useEffect(() => {
    const totalAmount = watchItems.reduce(
      (acc, item) => acc + (item.quantity * item.rate || 0),
      0,
    );
    const totalGST = watchItems.reduce(
      (acc, item) => acc + ((item.quantity * item.rate * item.gst) / 100 || 0),
      0,
    );
    setValue("totalAmount", totalAmount);
    setValue("totalGST", totalGST);
    setValue("cgst", totalGST / 2);
    setValue("sgst", totalGST / 2);
  }, [JSON.stringify(watchItems), setValue]);

  const onSubmit = async (data: any) => {
    const voucherNumber = await getNextVoucherNumber({ type: "Purchase" });
    console.log("Submitted data:", data, voucherNumber);
    if (!ledger) {
      console.error("Ledger not found");
      return;
    }

    const totalAmount = data.applyGST
      ? data.totalAmount + data.totalGST
      : data.totalAmount;
    const payload = {
      voucherNumber: voucherNumber,
      voucherDate: data.date,
      voucherType: "Purchase",
      payeeOrPayer: data.supplier._id,
      amount: totalAmount,
      paymentMethod: "Credit", // Assuming Cash as default, you might want to add this field to your form
      items: data.items.map((item: any) => ({
        itemName: item.itemName.name,
        quantity: item.quantity,
        rate: item.rate,
        amount:
          item.quantity * item.rate +
            (applyGST ? (item.quantity * item.rate * item.gst) / 100 : 0) || 0,
        batch: item.batch || "", // Assuming batch is not in your current form, you might want to add it
        expiryDate: item.expiryDate || new Date().toISOString(), // Assuming expiryDate is not in your current form, you might want to add it
      })),
      ledgerEntries: [
        {
          ledger: ledger.value,
          amount: totalAmount,
          drOrCr: "D",
        },
        {
          ledger: data.supplier._id, // You might want to dynamically set this based on the supplier
          amount: totalAmount,
          drOrCr: "C",
        },
      ],
      description:
        data.description || `Purchase of products from ${data.supplier}`, // Assuming description is not in your current form, you might want to add it
    };

    console.log("Submitted Payload:", payload);
  };

  return (
    <Box
      mt={4}
      p={2}
      margin="auto"
      className="flex flex-col items-center justify-center"
    >
      <Typography variant="h5" gutterBottom align="center" color="primary">
        Purchase Voucher
      </Typography>
      <Card elevation={0} sx={{ width: "85%" }}>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ fontSize: "0.9rem" }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Date"
                      type="date"
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.date}
                      helperText={errors.date ? errors.date.message : ""}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <LookupDropdown
                  label="Supplier"
                  control={control}
                  name="supplier"
                  setValue={setValue}
                  fetchFunction={async (search: string) => {
                    const response = await lookups({
                      model: "Ledger",
                      search: search || "",
                      searchColumns: ["ledgerName"],
                    });
                    return response.data.data.filter(
                      (item: any) =>
                        item.groupID.groupName === "Sundry Creditors",
                    );
                  }}
                  CreateModalComponent={(props) => (
                    <SupplierCreationForm {...props} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="invoiceNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Invoice Number"
                      fullWidth
                      size="small"
                      error={!!errors.invoiceNumber}
                      helperText={
                        errors.invoiceNumber ? errors.invoiceNumber.message : ""
                      }
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Items
                </Typography>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item Name</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Rate</TableCell>
                        <TableCell align="right">GST %</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">GST Amount</TableCell>
                        <TableCell align="right">Batch</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={index + "items"}>
                          <TableCell width={300}>
                            <ProductDropdown
                              control={control}
                              name={`items.${index}.itemName`}
                              setValue={setValue}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Controller
                              name={`items.${index}.quantity`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  type="number"
                                  size="small"
                                  error={!!errors.items?.[index]?.quantity}
                                  helperText={
                                    errors.items?.[index]?.quantity?.message ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Controller
                              name={`items.${index}.rate`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  type="number"
                                  size="small"
                                  error={!!errors.items?.[index]?.rate}
                                  helperText={
                                    errors.items?.[index]?.rate?.message || ""
                                  }
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Controller
                              name={`items.${index}.gst`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  type="number"
                                  size="small"
                                  error={!!errors.items?.[index]?.gst}
                                  helperText={
                                    errors.items?.[index]?.gst?.message || ""
                                  }
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              value={
                                watchItems[index].quantity *
                                  watchItems[index].rate || 0
                              }
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              value={
                                (watchItems[index].quantity *
                                  watchItems[index].rate *
                                  watchItems[index].gst) /
                                  100 || 0
                              }
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {watchItems[index]?.itemName && (
                              <BatchSelect
                                control={control}
                                name={`items.${index}.batch`}
                                index={index}
                                batches={
                                  watchItems[index]?.itemName?.batches || []
                                }
                                error={
                                  errors.items?.[index]?.batch?.message || ""
                                }
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={() => remove(index)}
                              color="secondary"
                              aria-label="remove item"
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                <Button
                  onClick={() =>
                    append({
                      itemName: "",
                      quantity: 1,
                      rate: 0,
                      gst: 0,
                      amount: 0,
                      gstAmount: 0,
                    })
                  }
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  size="small"
                >
                  Add Item
                </Button>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Controller
                      name="applyGST"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          {...field}
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          size="small"
                        />
                      )}
                    />
                  }
                  label="Apply GST"
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    fontSize: "0.8rem",
                  }}
                >
                  <Box>
                    <Typography variant="body2">Total Amount:</Typography>
                    <Typography variant="body2">Total GST:</Typography>
                    <Typography variant="body2">CGST:</Typography>
                    <Typography variant="body2">SGST:</Typography>
                    <Typography variant="body2">
                      <strong>Grand Total:</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2">
                      {watch("totalAmount").toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      {applyGST ? watch("totalGST").toFixed(2) : "0.00"}
                    </Typography>
                    <Typography variant="body2">
                      {applyGST ? watch("cgst").toFixed(2) : "0.00"}
                    </Typography>
                    <Typography variant="body2">
                      {applyGST ? watch("sgst").toFixed(2) : "0.00"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>
                        {(applyGST
                          ? watch("totalAmount") + watch("totalGST")
                          : watch("totalAmount")
                        ).toFixed(2)}
                      </strong>
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="small"
                >
                  Submit Purchase Voucher
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PurchaseVoucherForm;
