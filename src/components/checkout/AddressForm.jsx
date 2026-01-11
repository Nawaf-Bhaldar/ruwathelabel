import React, { useEffect, useState } from "react";
import countriesData from "../../data/countries+states+cities.json";

const AddressForm = ({ formData, setFormData }) => {
  const [countries] = useState(countriesData);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const updateField = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => {
    const c = countries.find((x) => x.name === (formData.country || "Kuwait"));
    if (c) setStates(c.states || []);
  }, [formData.country]);

  useEffect(() => {
    const c = countries.find((x) => x.name === (formData.country || "Kuwait"));
    const s = c?.states?.find((x) => x.name === formData.state);
    setCities(s?.cities || []);
  }, [formData.state]);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-neutral-900">ADDRESS</h2>

      <div className="grid grid-cols-2 gap-4 text-sm font-[Montserrat]">
        {/* Country */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">Country</label>
          <select
            name="country"
            value={formData.country}
            onChange={updateField}
            className="border border-neutral-300 rounded-md px-3 py-2"
          >
            {countries.map((c) => (
              <option key={c.iso2} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* State */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">State</label>
          <select
            name="state"
            value={formData.state}
            onChange={updateField}
            className="border border-neutral-300 rounded-md px-3 py-2"
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">City</label>
          <select
            name="city"
            value={formData.city}
            onChange={updateField}
            className="border border-neutral-300 rounded-md px-3 py-2"
          >
            <option value="">Select City</option>
            {cities.map((c, idx) => (
              <option key={idx} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Address Type */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">Address Type</label>
          <select
            name="addressType"
            value={formData.addressType}
            onChange={updateField}
            className="border border-neutral-300 rounded-md px-3 py-2"
          >
            <option value="">Select</option>
            <option value="flat">Flat</option>
            <option value="house">House</option>
          </select>
        </div>

        {/* Block */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">Block</label>
          <input
            name="block"
            value={formData.block}
            onChange={updateField}
            className="border border-neutral-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Street */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">Street</label>
          <input
            name="street"
            value={formData.street}
            onChange={updateField}
            className="border border-neutral-300 rounded-md px-3 py-2"
          />
        </div>

        {/* House / Flat */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">
            House No. / Flat No.
          </label>
          <input
            name="house"
            value={formData.house}
            onChange={updateField}
            className="border border-neutral-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Zip */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">Zip Code</label>
          <input
            name="zip"
            value={formData.zip}
            onChange={updateField}
            className="border border-neutral-300 rounded-md px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
