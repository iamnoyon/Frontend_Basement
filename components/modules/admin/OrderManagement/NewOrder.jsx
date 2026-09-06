"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  Minus,
  Plus,
  Trash2,
  Table2,
  ShoppingCart,
  ChevronUp,
  X,
  List,
} from "lucide-react";
import { useGetTableDropdownQuery } from "@/store/admin/table";
import { useGetCategoryDropdownQuery } from "@/store/admin/category";
import { useLazyGetProductsByCategoryQuery } from "@/store/admin/products";
import { useCreateOrderMutation, useLazyGetOrderListQuery } from "@/store/admin/order";
import useToaster from "@/components/hooks/useToaster";
import CustomDrawer from "@/components/common/CustomDrawer";
import Image from "next/image";
import OrderList from "./OrderList";
import { useGetWaiterListQuery } from "@/store/admin/user-management";
import useDownloadReceipt from "@/components/Receipt/useDownloadReceipt";

const tableBtnClass = (isSelected) =>
  `flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border-2 transition-all cursor-pointer aspect-square w-full ${isSelected
    ? "bg-[#043570] border-[#043570] text-white"
    : "bg-white border-gray-200 text-gray-500 hover:border-[#0A4D99] hover:text-[#0A4D99]"
  }`;

const catBtnClass = (isActive) =>
  `flex flex-col items-center gap-1 px-3 py-2 rounded-lg shrink-0 transition-colors cursor-pointer text-sm min-w-[72px] ${isActive
    ? "text-[#043570] bg-blue-50"
    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
  }`;

const productCardClass =
  "bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group";

const ProductSkeleton = () => (
  <div className={productCardClass}>
    <div className="h-32 md:h-44 bg-gray-200 animate-pulse" />
    <div className="p-2 md:p-3 space-y-2">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
    </div>
  </div>
);

const FallbackImage = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  if (error || !src) {
    return <div className={`bg-gray-200 ${className}`} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={200}
      height={200}
      unoptimized
      className={className}
      onError={() => setError(true)}
    />
  );
};

const NewOrder = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editOrderId, setEditOrderId] = useState(null);
  const { successToaster, errorToaster } = useToaster();
  const downloadReceipt = useDownloadReceipt();
  const business = useSelector((state) => state?.user?.business);


  const { data: tableDropdown, isLoading: tablesLoading } = useGetTableDropdownQuery();
  const { data: categoryDropdown, isLoading: categoriesLoading } = useGetCategoryDropdownQuery();
  const { data: waiterList } = useGetWaiterListQuery()
  const [triggerProducts, { data: productList, isLoading: productsLoading }] = useLazyGetProductsByCategoryQuery();
  const [createOrder, { isLoading: orderLoading }] = useCreateOrderMutation();
  const [triggerOrders] = useLazyGetOrderListQuery();

  const tables = tableDropdown?.data || [];
  const categories = categoryDropdown?.data || [];
  const products = productList?.data || [];

  const [selectedWaiter, setSelectedWaiter] = useState(null);

  useEffect(() => {
    if (selectedCategory?.id) {
      triggerProducts(
        { categoryId: selectedCategory.id },
        { preferCache: true }
      );
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories]);

  useEffect(() => {
    if (drawerOpen) {
      triggerOrders({ page: 1, limit: 20 });
    }
  }, [drawerOpen]);

  const handleEditOrder = (orderId) => {
    setEditOrderId(orderId);
    setEditDrawerOpen(true);
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.productName,
          price: product.soldPrice,
          imageUrl: product.imageUrl,
          qty: 1,
        },
      ];
    });
  };

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.productId === productId ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount("");
    setSelectedTable(null);
    setSelectedWaiter(null);
    setCartOpen(false);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountValue = parseFloat(discount) || 0;
  const afterDiscount = Math.max(0, subtotal - discountValue);
  const vat = afterDiscount * 0;
  const grandTotal = afterDiscount + vat;
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      errorToaster("Cart is empty");
      return;
    }

    // const result = await Swal.fire({
    //   title: "Confirm Order",
    //   text: `Place order for ${selectedTable.tableName}?`,
    //   icon: "question",
    //   width: "350px",
    //   padding: "1.25rem",
    //   showCancelButton: true,
    //   confirmButtonColor: "#043570",
    //   cancelButtonColor: "#d33",
    //   confirmButtonText: "Yes, place order",
    //   cancelButtonText: "Cancel",
    //   didOpen: (popup) => {
    //     const icon = popup.querySelector(".swal2-icon");
    //     if (icon) icon.style.transform = "scale(0.7)";
    //   },
    // });
    // if (!result.isConfirmed) return;

    const products = cart.map((item) => ({
      productId: item.productId,
      quantity: item.qty,
    }));

    const payload = {
      tableId: selectedTable?.id || null,
      products,
      waiterId: selectedWaiter?.id || null,
      totalBill: subtotal,
      discount: discountValue,
      subTotal: afterDiscount,
      billStatus: "unpaid",
    };

    try {
      const res = await createOrder(payload).unwrap();
      if (res?.success) {
        const newReceiptData = {
          restaurant: {
            name: business?.businessName || "Engineer's Restaurant",
            address: `${business?.area}, ${business?.thana}`,
            phone: "+880 1700-000000",
            logo: "/cafe_icon.png",
          },
          invoiceNo: `INV-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          items: cart.map((item) => ({
            qty: item.qty,
            name: item.productName,
            price: item.price,
          })),
          taxRate: vat,
          discount: discountValue,
          tax: vat,
          total: grandTotal.toFixed(2),
        };
        successToaster(res?.message || "Order placed successfully!");
        downloadReceipt(newReceiptData);
        clearCart();
      }
    } catch (err) {
      errorToaster(err?.data?.message || "Failed to place order");
    }
  };

  /* ============ RENDER HELPERS ============ */

  const renderTables = () => (
    <div>
      <h3 className="text-sm font-semibold text-[#043570] mb-3">Select Table</h3>
      {tablesLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2 md:gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No tables available</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2 md:gap-3">
          {tables.map((table) => {
            const isSelected = selectedTable?.id === table.id;
            return (
              <button
                key={table.id}
                onClick={() => setSelectedTable(isSelected ? null : table)}
                className={tableBtnClass(isSelected)}
              >
                <Table2 size={16} className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                <span className="text-[10px] sm:text-xs font-semibold truncate px-1">{table.tableName}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderWaiter = () => {
    const waiters = waiterList?.data || [];
    return (
      <div>
        <h3 className="text-sm font-semibold text-[#043570] mb-3">Select Waiter</h3>
        {waiters.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">No waiters found</p>
        ) : (
          <div className="flex gap-3 lg:flex-col lg:gap-1 overflow-x-auto pb-2 lg:pb-0 lg:space-y-3">
            {waiters.map((waiter) => {
              const isSelected = selectedWaiter?.id === waiter.id;
              return (
                <button
                  key={waiter.id}
                  onClick={() => setSelectedWaiter(isSelected ? null : waiter)}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors shrink-0 min-w-[180px] lg:min-w-0 cursor-pointer ${isSelected ? "bg-[#043570] text-white" : "hover:bg-gray-50"
                    }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {waiter.profileImageUrl ? (
                      <FallbackImage
                        src={waiter.profileImageUrl}
                        alt={waiter.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className={`text-sm font-bold ${isSelected ? "text-[#043570]" : "text-gray-400"}`}>
                        {waiter.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-gray-800"}`}>
                      {waiter.name}
                    </p>
                  </div>
                  {isSelected && (
                    <X size={16} className="shrink-0 text-white/70 hover:text-white" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderCategoryNav = () => (
    <div className="flex gap-1 overflow-x-auto px-4 py-3">
      {categoriesLoading ? (
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-20 h-16 bg-gray-100 rounded-lg animate-pulse shrink-0" />
          ))}
        </div>
      ) : (
        categories.map((cat) => {
          const isActive = selectedCategory?.id === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={catBtnClass(isActive)}
            >
              {cat?.imageUrl ? (
                <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                  <FallbackImage
                    src={cat.imageUrl}
                    alt={cat.categoryName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-[50px] h-[50px] rounded-full bg-gray-200" />
              )}
              <span className="text-xs font-medium">{cat?.categoryName}</span>
              {isActive && <div className="h-0.5 w-full bg-[#043570] rounded-full mt-0.5" />}
            </button>
          );
        })
      )}
    </div>
  );

  const renderProductGrid = () => (
    <div className="grid grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-4">
      {productsLoading ? (
        <>
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
        </>
      ) : products.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
          <p className="text-sm">No products in this category</p>
        </div>
      ) : (
        products.map((product) => (
          <div
            key={product.id}
            className={`${productCardClass} cursor-pointer`}
            onClick={() => addToCart(product)}
          >
            <div className="relative h-32 md:h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
              <FallbackImage
                src={product?.imageUrl}
                alt={product?.productName}
                className="w-full h-full object-cover"
              />
              <button className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#0A4D99] text-white flex items-center justify-center shadow-lg hover:bg-[#063C76] transition-all cursor-pointer md:opacity-0 md:group-hover:opacity-100">
                <Plus size={18} />
              </button>
            </div>
            <div className="p-2 md:p-3">
              <h4 className="text-xs md:text-sm font-semibold text-gray-800 truncate">{product?.productName}</h4>
              <p className="text-xs md:text-sm font-bold text-gray-900 mt-0.5 md:mt-1">৳{product?.soldPrice}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderCartItems = () => (
    <div className="space-y-2 md:space-y-3">
      {cart.map((item) => (
        <div key={item.productId} className="flex items-center gap-2 md:gap-2 p-2 rounded-lg bg-gray-50">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
            <FallbackImage
              src={item.imageUrl}
              alt={item.productName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-800 truncate">{item.productName}</p>
            <p className="text-xs text-gray-500">৳{item.price}</p>
          </div>
          <div className="flex md:hidden 2xl:flex items-center gap-1">
            <button
              onClick={() => updateQty(item.productId, -1)}
              className="flex h-6 w-6 items-center justify-center bg-white text-gray-600 transition hover:bg-gray-100 active:bg-gray-200"
            >
              <Minus size={10} />
            </button>

            <span className="flex h-6 min-w-[30px] items-center justify-center border-x border-gray-200 bg-gray-50 text-sm font-semibold text-[#043570]">
              {item.qty}
            </span>

            <button
              onClick={() => updateQty(item.productId, 1)}
              className="flex h-6 w-6 items-center justify-center bg-white text-gray-600 transition hover:bg-gray-100 active:bg-gray-200"
            >
              <Plus size={10} />
            </button>
          </div>

          <div className="">
            <div className="hidden md:flex 2xl:hidden items-center gap-1 mb-1">
              <button
                onClick={() => updateQty(item.productId, -1)}
                className="flex h-6 w-6 items-center justify-center bg-white text-gray-600 transition hover:bg-gray-100 active:bg-gray-200"
              >
                <Minus size={10} />
              </button>

              <span className="flex h-6 min-w-[30px] items-center justify-center border-x border-gray-200 bg-gray-50 text-sm font-semibold text-[#043570]">
                {item.qty}
              </span>

              <button
                onClick={() => updateQty(item.productId, 1)}
                className="flex h-6 w-6 items-center justify-center bg-white text-gray-600 transition hover:bg-gray-100 active:bg-gray-200"
              >
                <Plus size={10} />
              </button>
            </div>
            <div className="flex items-center gap-1 justify-end">
              <span className="text-xs md:text-sm font-semibold text-gray-800 min-w-[40px] md:min-w-[50px] text-right">৳{item.price * item.qty}</span>
              <button
                onClick={() => removeFromCart(item.productId)}
                className="shrink-0 text-gray-400 hover:text-[#EF4444] transition-colors cursor-pointer"
              >
                <Trash2 size={14} className="md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBillSummary = () => (
    <div className="space-y-1.5 text-xs md:text-sm">
      <div className="flex justify-between text-gray-600">
        <span>Subtotal</span>
        <span>৳{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Discount</span>
        <span className="text-[#EF4444]">- ৳{discountValue.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>VAT (0%)</span>
        <span>৳{vat.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold text-sm md:text-base pt-2 border-t border-gray-100">
        <span className="text-gray-800">Grand Total</span>
        <span className="text-[#043570]">৳{grandTotal.toFixed(2)}</span>
      </div>
    </div>
  );

  const renderCartActions = () => (
    <>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Overall Discount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">৳</span>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="0"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={clearCart}
          className="flex-1 py-2 md:py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Clear
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={orderLoading}
          className={`flex-[2] py-2 md:py-2.5 rounded-lg text-sm font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-2 ${!orderLoading ? "bg-[#042A55] hover:bg-[#063C76]" : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          {orderLoading ? "Placing..." : "Proceed to Bill"}
        </button>
      </div>
    </>
  );

  /* ============ MOBILE CART BOTTOM BAR ============ */
  const renderMobileCartBar = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {cartOpen ? (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setCartOpen(false)} />
          <div className="relative z-50 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-[#043570]" />
                <span className="text-sm font-semibold text-[#043570]">Current Order</span>
                {selectedTable && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-xs font-medium text-[#043570]">
                    <Table2 size={10} />{selectedTable.tableName}
                  </span>
                )}
              </div>
              <button onClick={() => setCartOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <ShoppingCart size={32} className="mb-2" />
                  <p className="text-sm">No items in order</p>
                </div>
              ) : (
                renderCartItems()
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Overall Discount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">৳</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300"
                    />
                  </div>
                </div>
                {renderBillSummary()}
                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={orderLoading}
                    className={`flex-[2] py-2.5 rounded-lg text-sm font-semibold text-white transition-colors cursor-pointer ${!orderLoading ? "bg-[#042A55] hover:bg-[#063C76]" : "bg-gray-300 cursor-not-allowed"
                      }`}
                  >
                    {orderLoading ? "Placing..." : "Proceed to Bill"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <button
          onClick={() => setCartOpen(true)}
          className="w-full bg-[#043570] text-white px-4 py-3 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} />
            <span className="text-sm font-semibold">
              {cartCount > 0 ? `${cartCount} items` : "Cart"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {cartCount > 0 && <span className="text-sm font-bold">৳{subtotal.toFixed(0)}</span>}
            <ChevronUp size={18} />
          </div>
        </button>
      )}
    </div>
  );

  /* ============ MAIN LAYOUT ============ */

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-[#043570]">New Order</h2>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#0A4D99] text-white hover:bg-[#063C76] transition-colors cursor-pointer"
        >
          <List size={16} />
          Order List
        </button>
      </div>

      {/* ======================== MOBILE & TABLET (<lg) ======================== */}
      <div className="lg:hidden flex flex-col gap-3 pb-20">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          {renderTables()}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
            {renderCategoryNav()}
          </div>

          <div className="px-4 py-3">
            <h3 className="text-base font-semibold text-[#043570]">{selectedCategory?.categoryName}</h3>
          </div>

          <div className="px-4 pb-4">
            {renderProductGrid()}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          {renderWaiter()}
        </div>

        {renderMobileCartBar()}
      </div>

      {/* ======================== DESKTOP (lg+) ======================== */}
      <div className="hidden lg:flex h-[calc(100vh-150px)] gap-4">
        <div className="w-[20%] min-w-[220px] flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            {renderTables()}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            {renderWaiter()}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
            {renderCategoryNav()}
          </div>

          <div className="px-4 py-3">
            <h3 className="text-lg font-semibold text-[#043570]">{selectedCategory?.categoryName}</h3>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="grid grid-cols-2 2xl:grid-cols-3 gap-4">
              {productList?.data?.map((product) => (
                <div
                  key={product.id}
                  className={`${productCardClass} cursor-pointer`}
                  onClick={() => addToCart(product)}
                >
                  <div className="relative h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <FallbackImage
                      src={product?.imageUrl}
                      alt={product?.productName}
                      className="w-full h-full object-cover"
                    />
                    <button className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-[#0A4D99] text-white flex items-center justify-center shadow-lg hover:bg-[#063C76] transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">{product?.productName}</h4>
                    <p className="text-sm font-bold text-gray-900 mt-1">৳{product?.soldPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-[25%] min-w-[300px] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#043570] flex items-center gap-2">
              <ShoppingCart size={18} />
              Current Order
            </h3>
            {selectedTable && (
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-xs font-medium text-[#043570]">
                  <Table2 size={12} />{selectedTable.tableName}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart size={40} className="mb-2" />
                <p className="text-sm">No items in order</p>
                <p className="text-xs mt-1">Add products to get started</p>
              </div>
            ) : (
              renderCartItems()
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-3 space-y-3">
              {renderBillSummary()}
              {renderCartActions()}
            </div>
          )}
        </div>
      </div>

      <CustomDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Order List"
      >
        <OrderList onEditOrder={handleEditOrder} />
      </CustomDrawer>
    </div>
  );
};

export default NewOrder;
