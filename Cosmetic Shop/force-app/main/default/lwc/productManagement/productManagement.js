import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import getProducts from '@salesforce/apex/ProductController.getProducts';
import createProduct from '@salesforce/apex/ProductController.createProduct';
import updateProduct from '@salesforce/apex/ProductController.updateProduct';
import deleteProduct from '@salesforce/apex/ProductController.deleteProduct';

export default class ProductManagement extends LightningElement {

    products = [];
    allProducts = [];
    wiredResult;

    isLoading = false;

    // Create Modal

    showModal = false;

    productName = '';
    category = '';
    price = null;
    stockQuantity = null;
    description = '';

    fileName = '';
    base64Data = '';

    previewImage;

    // Edit Modal

    showEditModal = false;

    selectedProductId;

    editProductName = '';
    editCategory = '';
    editPrice = null;
    editStockQuantity = null;
    editDescription = '';

    editImagePreview;

    editFileName = '';
    editBase64Data = '';

    categoryOptions = [
        { label: "Makeup", value: "Makeup" },
        { label: "Skin Care", value: "Skin Care" },
        { label: "Hair Care", value: "Hair Care" },
        { label: "Bath and Body", value: "Bath and Body" },
        { label: "Fragrance", value: "Fragrance" },
        { label: "Beauty Tools", value: "Beauty Tools" },
        { label: "Sun Care", value: "Sun Care" },
        { label: "Lip Care", value: "Lip Care" },
        { label: "Eye Care", value: "Eye Care" }
    ];

    showFilters = false;

    selectedCategory = 'All';
    selectedAvailability = 'All';
    selectedPriceRange = 'All';

    categoryFilterOptions = [
    { label: "Makeup", value: "Makeup" },
    { label: "Skin Care", value: "Skin Care" },
    { label: "Hair Care", value: "Hair Care" },
    { label: "Bath and Body", value: "Bath and Body" },
    { label: "Fragrance", value: "Fragrance" },
    { label: "Beauty Tools", value: "Beauty Tools" },
    { label: "Sun Care", value: "Sun Care" },
    { label: "Lip Care", value: "Lip Care" },
    { label: "Eye Care", value: "Eye Care" }
  ];

    availabilityOptions = [
        { label: 'All Products', value: 'All' },
        { label: 'In Stock', value: 'InStock' },
        { label: 'Out Of Stock', value: 'OutOfStock' }
    ];

    priceOptions = [
        { label: 'All Prices', value: 'All' },
        { label: '₹0 - ₹500', value: '0-500' },
        { label: '₹500 - ₹1000', value: '500-1000' },
        { label: '₹1000 - ₹2000', value: '1000-2000' },
        { label: '₹2000+', value: '2000+' }
    ];

    toggleFilters() {
        this.showFilters = !this.showFilters;
    }   

    handleCategoryFilter(event) {
        this.selectedCategory = event.detail.value;
    }

    handleAvailabilityFilter(event) {
        this.selectedAvailability = event.detail.value;
    }

    handlePriceFilter(event) {
        this.selectedPriceRange = event.detail.value;
    }

    clearFilters() {

        this.selectedCategory = 'All';
        this.selectedAvailability = 'All';
        this.selectedPriceRange = 'All';

        this.products = [...this.allProducts];
    }

    applyFilters() {

        let filtered = [...this.allProducts];

        if(this.selectedCategory !== 'All') {

            filtered = filtered.filter(
                product =>
                    product.category ===
                    this.selectedCategory
            );
        }

        if(this.selectedAvailability === 'InStock') {

            filtered = filtered.filter(
                product =>
                    product.stockQuantity > 0
            );
        }

        if(this.selectedAvailability === 'OutOfStock') {

            filtered = filtered.filter(
                product =>
                    product.stockQuantity <= 0
            );
        }

        this.products = filtered;

        this.showFilters = false;
    }

    @wire(getProducts)
    wiredProducts(result){

        this.wiredResult = result;

        const {data,error} = result;

        if(data){

            const formattedProducts =
                data.map(product => {

                    return {

                        ...product,

                        stockLabel:
                            product.stockQuantity > 0
                            ? `${product.stockQuantity} In Stock`
                            : 'Out Of Stock',

                        stockClass:
                            product.stockQuantity > 0
                            ? 'stock-badge'
                            : 'stock-badge out-stock'
                    };
                });

            this.products = formattedProducts;
            this.allProducts = formattedProducts;

        } else if(error){

            console.error(error);
        }
    }

    /* ---------------------
       CREATE PRODUCT
    --------------------- */

    openModal() {

        this.resetForm();

        this.showModal = true;
    }

    closeModal() {
        this.resetForm();
        this.showModal = false;
    }

    handleProductName(event) {
        this.productName = event.target.value;
    }

    handleCategory(event) {
        this.category = event.detail.value;
    }

    handlePrice(event) {
        this.price = event.target.value;
    }

    handleStockQuantity(event) {
        this.stockQuantity = event.target.value;
    }

    handleDescription(event) {
        this.description = event.target.value;
    }

    handleFileChange(event) {

        const file = event.target.files[0];

        if (!file) {
            return;
        }

        this.fileName = file.name;

        const reader = new FileReader();

        reader.onload = () => {

            this.previewImage =
                reader.result;

            this.base64Data =
                reader.result.split(',')[1];
        };

        reader.readAsDataURL(file);
    }

    saveProduct() {

        this.isLoading = true;

        createProduct({

            productName: this.productName,
            category: this.category,
            price: this.price,
            stockQuantity: this.stockQuantity,
            description: this.description,
            fileName: this.fileName,
            base64Data: this.base64Data

        })
        .then(() => {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Product Created Successfully',
                    variant: 'success'
                })
            );

            this.closeModal();

            return refreshApex(
                this.wiredResult
            );
        })
        .catch(error => {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message:
                        error?.body?.message ||
                        'Something went wrong',
                    variant: 'error'
                })
            );
        })
        .finally(() => {

            this.isLoading = false;
        });
    }

    /* ---------------------
       EDIT PRODUCT
    --------------------- */

    handleEdit(event) {

        const productId =
            event.currentTarget.dataset.id;

        const product =
            this.products.find(
                item =>
                    item.productId === productId
            );

        if (!product) {
            return;
        }

        this.selectedProductId =
            productId;

        this.editProductName =
            product.name;

        this.editCategory =
            product.category;

        this.editPrice =
            product.price;

        this.editStockQuantity =
            product.stockQuantity;

        this.editDescription =
            product.description;

        this.editImagePreview =
            product.imageUrl;

        this.showEditModal = true;
    }

    closeEditModal() {

        this.showEditModal = false;

        this.editFileName = '';
        this.editBase64Data = '';
    }

    handleEditName(event) {
        this.editProductName =
            event.target.value;
    }

    handleEditCategory(event) {
        this.editCategory =
            event.detail.value;
    }

    handleEditPrice(event) {
        this.editPrice =
            event.target.value;
    }

    handleEditStock(event) {
        this.editStockQuantity =
            event.target.value;
    }

    handleEditDescription(event) {
        this.editDescription =
            event.target.value;
    }

    handleEditFileChange(event) {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        this.editFileName =
            file.name;

        const reader =
            new FileReader();

        reader.onload = () => {

            this.editImagePreview =
                reader.result;

            this.editBase64Data =
                reader.result.split(',')[1];
        };

        reader.readAsDataURL(file);
    }

    updateExistingProduct() {


    console.log('Product Id', this.selectedProductId);
    console.log('Name', this.editProductName);
    console.log('Category', this.editCategory);
    console.log('Price', this.editPrice);
    console.log('Stock', this.editStockQuantity);

 

        this.isLoading = true;

        updateProduct({

            productId:
                this.selectedProductId,

            productName:
                this.editProductName,

            category:
                this.editCategory,

            price:
                this.editPrice,

            stockQuantity:
                this.editStockQuantity,

            description:
                this.editDescription,

            fileName:
                this.editFileName,

            base64Data:
                this.editBase64Data
        })
        .then(() => {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Product Updated Successfully',
                    variant: 'success'
                })
            );

            this.closeEditModal();

            return refreshApex(
                this.wiredResult
            );
        })
        .catch(error => {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message:
                        error?.body?.message ||
                        'Update Failed',
                    variant: 'error'
                })
            );
        })
        .finally(() => {

            this.isLoading = false;
        });
    }

    /* ---------------------
       DELETE PRODUCT
    --------------------- */

    handleDelete(event) {

        const productId =
            event.currentTarget.dataset.id;

        const confirmed =
            confirm(
                'Are you sure you want to delete this product?'
            );

        if (!confirmed) {
            return;
        }

        this.isLoading = true;

        deleteProduct({
            productId: productId
        })
        .then(() => {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Deleted',
                    message: 'Product deleted successfully',
                    variant: 'success'
                })
            );

            return refreshApex(
                this.wiredResult
            );
        })
        .catch(error => {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message:
                        error?.body?.message ||
                        'Delete Failed',
                    variant: 'error'
                })
            );
        })
        .finally(() => {

            this.isLoading = false;
        });
    }

    /* ---------------------
       UTILITIES
    --------------------- */

    resetForm() {

        this.productName = '';
        this.category = '';
        this.price = null;
        this.stockQuantity = null;
        this.description = '';

        this.fileName = '';
        this.base64Data = '';

        this.previewImage = null;
    }


    handleSearch(event){

    const searchKey =
        event.target.value.toLowerCase();

    if(!searchKey){

        this.products =
            [...this.allProducts];

        return;
    }

        this.products = this.allProducts.filter(
            product =>

                product.name
                    ?.toLowerCase()
                    .includes(searchKey)

                ||

                product.category
                    ?.toLowerCase()
                    .includes(searchKey)
        );
    }
}