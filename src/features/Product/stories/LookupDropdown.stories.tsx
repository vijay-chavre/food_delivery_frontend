import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { useForm } from "react-hook-form";
import LookupDropdown from "../LookupDropdown/LookupDropdown";
import CategoryBrandCreate from "../CategoryDropdown/CategoryBrandCreate";
import { lookups } from "@/services/product/lookupService";
import { Button } from "@mui/material";

const WrapperComponent = ({ model }: { model: string }) => {
  const { control, setValue, handleSubmit, getValues } = useForm();

  const mapBrand = (item: any) => ({
    name: item.name || item.groupName || item.ledgerName,
    _id: item._id,
    description: item.description,
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {" "}
      <LookupDropdown
        label="Brand"
        control={control}
        name="brand"
        setValue={setValue}
        fetchFunction={async () => {
          const response = await lookups({ model: model });
          return response.data;
        }}
        mapOption={mapBrand}
        CreateModalComponent={(props) => (
          <CategoryBrandCreate type="brand" {...props} />
        )}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};

const meta = {
  component: WrapperComponent,
  tags: ["autodocs"],
} satisfies Meta<typeof WrapperComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BrandDropdownDefaultLookup: Story = {
  args: {
    model: "brand",
  },
};
