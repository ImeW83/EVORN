import { model, models, Schema, Types, type Model } from "mongoose";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/config";

// `models.X ?? model(...)` keeps hot reloading from re-registering a model.
function define<T>(name: string, schema: Schema<T>, collection: string): Model<T> {
  return (models[name] as Model<T> | undefined) ?? model<T>(name, schema, collection);
}

const opts = { versionKey: false } as const;

export const CategoryModel = define(
  "Category",
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      slug: { type: String, required: true, unique: true },
      image: { type: new Schema({ url: String, publicId: String }, { _id: false }), default: null }, // shown on the home page tile
    },
    opts,
  ),
  "categories",
);

export const MaterialModel = define(
  "Material",
  new Schema({ name: { type: String, required: true, unique: true, trim: true } }, opts),
  "materials",
);

export const ProductModel = define(
  "Product",
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      slug: { type: String, required: true, unique: true },
      description: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      material: { type: String, required: true },
      images: { type: [new Schema({ url: String, publicId: String }, { _id: false })], default: [] },
      inStock: { type: Boolean, default: true },
      featured: { type: Boolean, default: false },
      categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    },
    { ...opts, timestamps: { createdAt: true, updatedAt: false } },
  ),
  "products",
);

export const UserModel = define(
  "User",
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      passwordHash: { type: String, required: true },
      phone: { type: String, default: null },
      address: { type: String, default: null },
      city: { type: String, default: null },
    },
    { ...opts, timestamps: { createdAt: true, updatedAt: false } },
  ),
  "users",
);

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true }, // snapshot at time of order
    price: { type: Number, required: true }, // snapshot at time of order
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

export const OrderModel = define(
  "Order",
  new Schema(
    {
      number: { type: String, required: true, unique: true },
      status: { type: String, enum: ORDER_STATUSES, default: "PENDING", index: true },
      paymentMethod: { type: String, enum: PAYMENT_METHODS, default: "COD" },
      paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "NONE" },
      receipt: {
        type: new Schema(
          { publicId: String, format: String, uploadedAt: Date },
          { _id: false },
        ),
        default: null,
      },
      paymentNote: { type: String, default: null }, // admin's reason when a receipt is rejected
      userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: null },
      address: { type: String, required: true },
      city: { type: String, required: true },
      notes: { type: String, default: null },
      items: { type: [OrderItemSchema], default: [] },
      subtotal: { type: Number, required: true },
      deliveryFee: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    { ...opts, timestamps: { createdAt: true, updatedAt: false } },
  ),
  "orders",
);

export const SettingModel = define(
  "Setting",
  new Schema({ key: { type: String, required: true, unique: true }, value: { type: String, required: true } }, opts),
  "settings",
);

export const BankAccountModel = define(
  "BankAccount",
  new Schema(
    {
      bank: { type: String, required: true, trim: true },
      accountName: { type: String, required: true, trim: true },
      accountNumber: { type: String, required: true, trim: true },
      branch: { type: String, required: true, trim: true },
      active: { type: Boolean, default: true },
    },
    { ...opts, timestamps: { createdAt: true, updatedAt: false } },
  ),
  "bankaccounts",
);

export const ReviewModel = define(
  "Review",
  new Schema(
    {
      productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      userName: { type: String, required: true }, // shown publicly: first name and last initial
      rating: { type: Number, required: true, min: 1, max: 5 },
      note: { type: String, default: "", maxlength: 1000 },
    },
    { ...opts, timestamps: true },
  ).index({ productId: 1, userId: 1 }, { unique: true }), // one review per customer per product
  "reviews",
);

export const isId = (id: unknown): id is string => typeof id === "string" && Types.ObjectId.isValid(id) && id.length === 24;
