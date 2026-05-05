import { Schema } from "mongoose";

export const required = {
   string:  { type: String,  required: true },
   number:  { type: Number,  required: true },
   boolean: { type: Boolean, required: true },
   date:    { type: Date,    required: true },
};

export const schemaTypes = Object.assign(required, {
   channelInfo: new Schema({ id: required.string, url: required.string }, { _id: false }),
   roleInfo:    new Schema({ id: required.string }, { _id: false }),
});
