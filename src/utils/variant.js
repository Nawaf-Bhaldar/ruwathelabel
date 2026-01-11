// src/utils/productVariants.js

export function extractVariantOptions(product) {
  if (!product?.productOptions) return [];

  const variants = [];

  product.productOptions.forEach((option) => {
    // ----- SINGLE SELECT -----
    // Handle both explicit "singleSelect" type and missing/undefined/null/empty type (default to singleSelect)
    const isSingleSelect = option.type === "singleSelect" || 
                          (!option.type && option.productOptionStockItems && option.productOptionStockItems.length > 0) ||
                          (option.type === null && option.productOptionStockItems && option.productOptionStockItems.length > 0) ||
                          (option.type === "" && option.productOptionStockItems && option.productOptionStockItems.length > 0);
    
    if (isSingleSelect) {
      // Handle isStock as boolean, string, or null/undefined
      let isStock = option.isStock;
      if (isStock === undefined || isStock === null) {
        isStock = true; // Default to true if not specified
      } else if (typeof isStock === 'string') {
        isStock = isStock.toLowerCase() === 'true' || isStock === '1';
      } else if (typeof isStock === 'number') {
        isStock = isStock === 1;
      }
      // If isStock is boolean false, it stays false
      
      variants.push({
        name: option.name,
        values: option.productOptionStockItems?.map((i) => i.value) || [],
        stockItems: option.productOptionStockItems || [],
        type: "singleSelect",
        isStock: isStock,
      });
    }

    // ----- LINKED GROUP -----
    else if (option.type === "linkedGroup") {
      (option.subOptions || []).forEach((sub) => {
        variants.push({
          name: sub.name,
          values: sub.productOptionStockItems?.map((i) => i.value) || [],
          stockItems: sub.productOptionStockItems || [],
          stockCombinations: option.stockCombinations
            ? typeof option.stockCombinations === 'string'
              ? JSON.parse(option.stockCombinations)
              : option.stockCombinations
            : [],
          type: "linkedGroup",
          linkedGroupId: option.id,
        });
      });
    }
  });

  return variants;
}

export function computeSelectedCombination(product, selectedCombination) {
  const variants = extractVariantOptions(product);

  // Case 1: No options (simple product)
  if (variants.length === 0) {
    const stock = product.stockOnHand || 0;
    return { isValid: stock > 0, extraPrice: 0, quantity: stock };
  }

  let valid = true;
  let extra = 0;
  let qty = Infinity;
  const processed = new Set();

  for (const variant of variants) {
    const chosen = selectedCombination[variant.name];
    if (!chosen) continue;

    // ----- SINGLE SELECT -----
    if (variant.type === "singleSelect") {
      const item = variant.stockItems.find((i) => i.value === chosen);

      // If stock OFF → ignore per-option quantity, use product.stockOnHand
      if (variant.isStock === false) {
        const totalStock = product.stockOnHand || 0;
        qty = Math.min(qty, totalStock);
        if (totalStock === 0) valid = false;
        extra += item?.extraPrice || 0;
      }

      // Stock ON (normal per-value stock)
      else if (item) {
        extra += item.extraPrice || 0;
        qty = Math.min(qty, item.quantity);
        if (item.quantity === 0) valid = false;
      }
    }

    // ----- LINKED GROUP -----
    if (
      variant.type === "linkedGroup" &&
      !processed.has(variant.linkedGroupId)
    ) {
      const group = variants.filter(
        (v) => v.linkedGroupId === variant.linkedGroupId
      );

      const allSelected = group.every((v) => selectedCombination[v.name]);

      if (allSelected) {
        const combo = variant.stockCombinations.find((c) =>
          group.every((v) =>
            c.Variants.some((x) => x[v.name] === selectedCombination[v.name])
          )
        );

        if (combo) {
          extra += combo.ExtraPrice || 0;
          qty = combo.Quantity;
          if (combo.Quantity === 0) valid = false;
        } else {
          valid = false;
          qty = 0;
        }

        processed.add(variant.linkedGroupId);
      }
    }
  }

  const allSelected =
    Object.keys(selectedCombination).length === variants.length;

  return {
    isValid: !allSelected || valid,
    extraPrice: extra,
    quantity: qty === Infinity ? 0 : qty,
  };
}

export function getStockItemIds(product, selectedCombination) {
  const ids = [];

  if (!product?.productOptions) return ids;

  product.productOptions.forEach((option) => {
    // singleSelect
    if (option.type === "singleSelect") {
      const selected = selectedCombination[option.name];
      if (!selected) return;

      const match = option.productOptionStockItems?.find(
        (i) => i.value === selected
      );
      if (match) ids.push(match.id);
    }

    // linkedGroup
    if (option.type === "linkedGroup") {
      (option.subOptions || []).forEach((sub) => {
        const selected = selectedCombination[sub.name];
        if (!selected) return;

        const match = sub.productOptionStockItems?.find(
          (i) => i.value === selected
        );
        if (match) ids.push(match.id);
      });
    }
  });

  return ids;
}
