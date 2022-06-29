// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/apikeys
var stripe = Stripe('pk_live_51IqqFOGBzizVF2C3ymju89cVYDyBWNcOUHC1uIXF66KCt8y8jHSJZZYH1bNjUvZ2cdmUXMPUAnHv5trNC6gbYXFt00MJJYLn6J');
var elements = stripe.elements();
var clientSecret

var style = {
  base: {
    color: "#32325d",
  }
};

var card = elements.create("card", { style: style });
card.mount("#card-element");

card.on('change', ({error}) => {
  let displayError = document.getElementById('card-errors');
  if (error) {
    displayError.textContent = error.message;
  } else {
    displayError.textContent = '';
  }
});

fetch('/create-payment-intent').then((resolve)=>{
  resolve.json().then((resolve)=>{
    clientSecret = resolve.clientSecret
  })
}).then(()=>{

    var form = document.getElementById('payment-form');

    form.addEventListener('submit', function(ev) {
      ev.preventDefault();

      $('#modalLoading').modal('show')
    

      stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card
          }
      }).then(function(result) {
        if (result.error) {
          // Show error to your customer (e.g., insufficient funds)
            alert(result.error.message);
        } else {
          // The payment has been processed!
          if (result.paymentIntent.status === 'succeeded') {
            location.href = 'paymentsuccesspage.html'
          }
        }

        $('#modalLoading').modal('hide')

      })
    })
  
})

