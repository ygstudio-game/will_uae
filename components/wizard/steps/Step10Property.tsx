"use client";

import React, { useState } from "react";
import { useWillStore } from "@/store/useWillStore";
import { Building, Plus, Trash2, Home, Landmark, Car, Briefcase } from "lucide-react";

export function Step10Property() {
  const { assets, addAsset, removeAsset } = useWillStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAsset, setNewAsset] = useState({
    assetType: "Immovable Property" as const,
    description: "",
    emirate: "Dubai",
    titleDeedNumber: "",
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.description) return;
    addAsset({
      id: `asset-${Date.now()}`,
      assetType: newAsset.assetType,
      description: newAsset.description,
      emirate: newAsset.emirate,
      titleDeedNumber: newAsset.titleDeedNumber,
    });
    setNewAsset({
      assetType: "Immovable Property",
      description: "",
      emirate: "Dubai",
      titleDeedNumber: "",
    });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-court-bronze mb-1">
          Official Court Clause · Section SEVEN (e)
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          UAE Property & Estate Residue
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          Under the ADJD Will template, your estate residue automatically covers all UAE real estate, bank accounts, vehicles, end-of-service gratuity, and personal property.
        </p>
      </div>

      {/* General Residue Statutory Box */}
      <div className="bg-white p-6 rounded-2xl border border-court-border shadow-court space-y-3">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-court-bronze" />
          <h3 className="font-serif font-bold text-base text-obsidian">
            Residue Estate Coverage (Automatic)
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          The legal text in Section SEVEN captures all present and future assets situated in the United Arab Emirates, including bank deposits, real estate holdings, company shares, motor vehicles, and gratuity entitlements without requiring an itemized declaration for legal validity.
        </p>
      </div>

      {/* Optional Specific Titled Assets Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-obsidian">
              Specific UAE Titled Assets (Optional Reference)
            </h3>
            <p className="text-xs text-gray-500">
              You may explicitly record specific title deed numbers or bank accounts for administrative clarity.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-obsidian hover:bg-obsidian-light text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-court-tan" />
            <span>Add Asset</span>
          </button>
        </div>

        {/* Existing Assets List */}
        {assets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white p-5 rounded-xl border border-court-border shadow-court flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-court-tan/15 text-court-bronze flex items-center justify-center flex-shrink-0 mt-0.5">
                    {asset.assetType === "Immovable Property" ? (
                      <Home className="w-4 h-4" />
                    ) : asset.assetType === "Bank Account" ? (
                      <Landmark className="w-4 h-4" />
                    ) : (
                      <Car className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-court-bronze-dark bg-court-tan/15 px-2 py-0.5 rounded">
                      {asset.assetType}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-obsidian mt-1.5">
                      {asset.description}
                    </h4>
                    {asset.emirate && (
                      <div className="text-xs text-gray-500 mt-0.5">Emirate: {asset.emirate}</div>
                    )}
                    {asset.titleDeedNumber && (
                      <div className="text-xs text-gray-600 font-mono mt-0.5">
                        Ref / Title Deed: {asset.titleDeedNumber}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeAsset(asset.id)}
                  className="text-gray-400 hover:text-red-700 p-1 rounded transition-colors"
                  title="Remove asset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-court-border text-gray-500 text-xs">
            No specific titled assets listed. The general residue clause in your Will will govern all your UAE assets automatically.
          </div>
        )}

        {/* Add Asset Modal / Inline Form */}
        {showAddForm && (
          <form
            onSubmit={handleAdd}
            className="bg-white p-6 rounded-2xl border-2 border-court-bronze/40 shadow-court space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="font-serif font-bold text-base text-obsidian">Add Asset Reference</span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-gray-400 hover:text-gray-700 font-semibold"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1">
                  Asset Type
                </label>
                <select
                  value={newAsset.assetType}
                  onChange={(e) => setNewAsset({ ...newAsset, assetType: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-court-border bg-white text-gray-900"
                >
                  <option value="Immovable Property">Real Estate / Immovable Property</option>
                  <option value="Bank Account">Bank Account / Deposits</option>
                  <option value="Vehicle">Motor Vehicle</option>
                  <option value="Shares">Company Shares / Business</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1">
                  Emirate
                </label>
                <select
                  value={newAsset.emirate}
                  onChange={(e) => setNewAsset({ ...newAsset, emirate: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-court-border bg-white text-gray-900"
                >
                  <option value="Dubai">Dubai</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Sharjah">Sharjah</option>
                  <option value="Ajman">Ajman</option>
                  <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                  <option value="Fujairah">Fujairah</option>
                  <option value="Umm Al Quwain">Umm Al Quwain</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1">
                  Title Deed / Account Number
                </label>
                <input
                  type="text"
                  value={newAsset.titleDeedNumber}
                  onChange={(e) => setNewAsset({ ...newAsset, titleDeedNumber: e.target.value })}
                  placeholder="e.g. TD-2021-99882"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-court-border bg-white text-gray-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1">
                Asset Description
              </label>
              <input
                type="text"
                required
                value={newAsset.description}
                onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                placeholder="e.g. Apartment 1402, Marina Crown Tower, Dubai Marina"
                className="w-full px-3 py-2 text-sm rounded-lg border border-court-border bg-white text-gray-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-court-bronze hover:bg-court-bronze-dark text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
              >
                Save Asset Reference
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
