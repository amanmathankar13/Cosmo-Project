<template>

    <lightning-card title="Customer Login">

        <div class="slds-p-around_medium">

            <lightning-input
                label="Username"
                name="username"
                type="email"
                onchange={handleChange}>
            </lightning-input>


            <lightning-input
                label="Password"
                name="password"
                type="password"
                onchange={handleChange}>
            </lightning-input>


            <lightning-button
                label="Login"
                variant="brand"
                onclick={handleLogin}>
            </lightning-button>


            <template if:true={errorMessage}>
                <p>{errorMessage}</p>
            </template>


        </div>

    </lightning-card>

</template>