const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "k6mj9fz5ew62",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "bHExx3qmBHRu-kdLu-0VtaCR6HpzZQmPbOW5ItgTTpI"
});
// console.log(client);
//  Variables 

const cartBtn =document.querySelector(".cart-btn");
const closeCartBtn=document.querySelector(".close-cart");
const clearCartBtn=document.querySelector(".clear-cart");
const cartDom=document.querySelector(".cart");
const cartOverlay=document.querySelector(".cart-overlay");
const cartItems=document.querySelector(".cart-items");
const cartTotal=document.querySelector(".cart-total");
const cartContent=document.querySelector(".cart-content");
const productsDOM=document.querySelector(".products-center");

// Cart

let cart=[]

// 
let buttonsDOM=[];

// getting the products

class Products{
    async getProducts(){
        try{
            let contentful = await client.getEntries({
                content_type: "mediaProducts"
            });
            console.log(contentful.items);

           

            let result = await fetch("products.json");
            let data=await result.json()

           let products=data.items;
           products=products.map(product=>{
               const {title,price}=product.fields;
               const {id}=product.sys;
               const image=product.fields.image.fields.file.url;
               return {title,price,id,image}
           })
           return products
        }catch(error){
            console.log(error);
        }
    }
}

// display products

class UI {
displayProduct(products){
    let result="";
    products.forEach(product => {
        result+=`
       
            <article class="product">
                <div class="img-container">
                     <img src=${product.image} class="product-img" alt="product" >
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fa fa-shopping-cart" aria-hidden="true"></i>
                        add to bag
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4> ${product.price}</h4>
            </article>
           
        `
    });
  productsDOM.innerHTML=result;
}
getBagButton(){
    const buttons=[...document.querySelectorAll(".bag-btn")];
    buttonsDOM=buttons;
    buttons.forEach(button=>{  
        let id=button.dataset.id;
        let inCart=cart.find(item=>item.id===id);
        if(inCart)
        {
            button.innerText="In Cart";
            button.disabled=true
        }       
            button.addEventListener('click',e=>{
                e.target.innerText="IN Cart";
                e.target.disabled=true;
                // get prduct from products
                let cartItem = {...Storage.getPruduct(id),amount:1}
                
                // add product to do cart
                cart=[...cart,cartItem];
                // save cart in local storage
                Storage.saveCart(cart);
                // set  cart value
                this.setCartValues(cart);
                // display cart item
                this.addCartItems(cartItem)
                // show cart item
                this.showCartItem();
            });        
    });
   
}
setCartValues(cart){
        let tempTotal=0;
        let itemsTotal=0;
        cart.map(item=>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartItems.innerText =itemsTotal;
        cartTotal.innerText =  parseFloat(tempTotal.toFixed(2));
        // console.log(cartItems,cartTotal);
    }
    addCartItems(item){
        const div=document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML=`  
                <img src=${item.image} alt="product">               
                <div>
                    <h4>${item.title}</h4>
                    <h5>${item.price}</h5>
                    <span class="remove-item" data-id=${item.id}>Remove</span>
                </div> 
                <div>
                    <i class="fa fa-chevron-up" aria-hidden="true" data-id=${item.id}></i>
                    <p class="item-amount">${item.amount}</p>
                    <i class="fa fa-chevron-down" aria-hidden="true" data-id=${item.id}></i>
                </div>`
        cartContent.appendChild(div);
        // console.log(cartContent);
    }
    showCartItem(){
        cartOverlay.classList.add('transparentBcg');
        cartDom.classList.add('showCart');
    }
    setupApp(){
       cart= Storage.getCart();
       this.setCartValues(cart);
       this.populatCart(cart);
       cartBtn.addEventListener('click',this.showCartItem);
       closeCartBtn.addEventListener('click',this.hidenCart)
    }
    populatCart(cart){
        cart.forEach(item=>this.addCartItems(item))
    }
    hidenCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDom.classList.remove('showCart');
    }
cartLogic(){
    clearCartBtn.addEventListener('click',()=>{
        this.clearCart()
    });
    cartContent.addEventListener('click',evnt => {
if(evnt.target.classList.contains('remove-item'))
{
    let removeItem=evnt.target;
    let id=removeItem.dataset.id;

    cartContent.removeChild(removeItem.parentElement.parentElement);
    this.removeItem(id);
}else if(evnt.target.classList.contains('fa-chevron-up'))
{
    let addAmount=evnt.target;
    let id = addAmount.dataset.id;
    let tempItem=cart.find(item=>item.id==id);
    // console.log(tempItem.amount);
    tempItem.amount += 1;
    Storage.saveCart(cart);
    this.setCartValues(cart);
    addAmount.nextElementSibling.innerText=tempItem.amount;

}else if(evnt.target.classList.contains('fa-chevron-down'))
{
    let lowerAmount=evnt.target;
    let id = lowerAmount.dataset.id;
    let tempItem=cart.find(item=>item.id==id);
    tempItem.amount -= 1;
    if(tempItem.amount > 0){
        Storage.saveCart(cart);
        this.setCartValues(cart);
         lowerAmount.previousElementSibling.innerText=tempItem.amount;
    }else{
        cartContent.removeChild(lowerAmount.parentElement.parentElement);
        this.removeItem(id);
    }

}

    
})
}



clearCart(){
    let cartItems=cart.map(item=>item.id);
    cartItems.forEach(id=>this.removeItem(id));
    while(cartContent.children.length > 0){
        cartContent.removeChild(cartContent.children[0])
    }
    this.hidenCart();
   
}
removeItem(id)
{
   cart = cart.filter(item =>item.id !==id);
   this.setCartValues(cart);
   Storage.saveCart(cart)
   let button = this.getSingleButton(id);
    button.disabled=false;
    button.innerHTML=`
        <i class="fa fa-shopping-cart" aria-hidden="true"></i>
                        add to bag
    `

}
getSingleButton(id){
    return buttonsDOM.find(button => button.dataset.id ===id);
}
}
 

// local storage

class Storage {

static saveProducts(products){
    localStorage.setItem("products",JSON.stringify(products));
}
static getPruduct(id){
    let products=JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id);
}
static saveCart(cart){
    localStorage.setItem("cart",JSON.stringify(cart))
}

static getCart(){
   return localStorage.getItem('cart') ?JSON.parse(localStorage.getItem('cart')):[]; 
}
}

document.addEventListener("DOMContentLoaded",()=>{
    const ui= new UI();
    const products=new Products();
    // setup App
    ui.setupApp();
    // get all products
    products.getProducts().then(products=>{
        ui.displayProduct(products);
        Storage.saveProducts(products)})
        .then(()=>{
             ui.getBagButton();
             ui.cartLogic();
        });
       
})

