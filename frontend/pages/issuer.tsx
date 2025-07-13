import React, { useState, ChangeEvent, FormEvent } from "react";

interface Organization {
  id: number;
  name: string;
  address: string;
  contact: string;
}

const IssuerPortal: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [form, setForm] = useState<Omit<Organization, "id">>({
    name: "",
    address: "",
    contact: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === editingId ? { id: editingId, ...form } : org
        )
      );
      setEditingId(null);
    } else {
      const newOrg: Organization = {
        id: Date.now(),
        ...form,
      };
      setOrganizations((prev) => [...prev, newOrg]);
    }
    setForm({ name: "", address: "", contact: "" });
  };

  const handleEdit = (org: Organization) => {
    setForm({ name: org.name, address: org.address, contact: org.contact });
    setEditingId(org.id);
  };

  const handleDelete = (id: number) => {
    setOrganizations((prev) => prev.filter((org) => org.id !== id));
    if (editingId === id) {
      setForm({ name: "", address: "", contact: "" });
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setForm({ name: "", address: "", contact: "" });
    setEditingId(null);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Issuer Portal - Organization Profiles</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="address">Address:</label>
          <input
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="contact">Contact:</label>
          <input
            id="contact"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">{editingId !== null ? "Save" : "Add"}</button>
        {editingId !== null && (
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </form>
      <ul>
        {organizations.map((org) => (
          <li key={org.id} style={{ marginBottom: "0.5rem" }}>
            <strong>{org.name}</strong> - {org.address} - {org.contact}
            <button
              style={{ marginLeft: "0.5rem" }}
              onClick={() => handleEdit(org)}
            >
              Edit
            </button>
            <button
              style={{ marginLeft: "0.5rem" }}
              onClick={() => handleDelete(org.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IssuerPortal;

