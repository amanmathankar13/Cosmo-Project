import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import USER_ID from '@salesforce/user/Id';
import getProducts from '@salesforce/apex/ProductController.getProducts';
import createProduct from '@salesforce/apex/ProductController.createProduct';
import updateProduct from '@salesforce/apex/ProductController.updateProduct';
import deleteProduct from '@salesforce/apex/ProductController.deleteProduct';

export default class CustomerPage extends LightningElement {

    products = [];
    allProducts = [];
    wiredResult;

    isLoading = false;

    // Create Modal

    showModal = false;

    productName = '';
    category = '';
    price = null;
    description = '';

    

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


    handleAddToCart(event) {

    const productId = event.currentTarget.dataset.id;

    const product = this.products.find(
        p => p.productId === productId
    );

    const storageKey = `COSMETIC_CART_${USER_ID}`;

    let cart = JSON.parse(localStorage.getItem(storageKey)) || [];

    const existing = cart.find(
        item => item.productId === productId
    );

    if (existing) {

        if (existing.quantity >= existing.stockQuantity) {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Insufficient stock available.',
                    variant: 'error'
                })
            );

            return;
        }

        existing.quantity++;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });

    }

    localStorage.setItem(storageKey, JSON.stringify(cart));

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Product added to cart.',
                variant: 'success'
            })
        );

    }
}