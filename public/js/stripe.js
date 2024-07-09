/* eslint-disable */
//& in frontEnd i use public Key BUT in back end i use private Key
const stripe = Stripe('pk_test_51PX8Ys2Kf69cyg52yziEUD9hwcCSAPzJeajAZqeq8zlTqPrPA6BMfrJ9aMwkFYrEmS8FSl95WIZISHesPplDr1dP001kOVWWrn');

const bookTour =async tourId =>{
    try{
 //1) Get checkout session from endpoint
    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);
 //2)create checkout FORM+ charge credit card
 await stripe.redirectToCheckout({
    sessionId:session.data.session.id
 })
    }catch(e){
        console.log(e);
    showAlert('error', e);
    }
}

if(document.getElementById('book-tour')){
    document.getElementById('book-tour').addEventListener('click',  async (e) => {
        e.target.textContent = 'Processing...';
      const {tourId} =  e.target.dataset;
       await bookTour(tourId);
    });
}

