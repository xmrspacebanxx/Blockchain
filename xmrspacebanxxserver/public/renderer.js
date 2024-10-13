const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.btn-Login');
const iconClose = document.querySelector('.icon-close');
const sendLink = document.querySelector('.send-link');
const walletLink = document.querySelector('.wallet-link');
const chartLink = document.querySelector('.chart-link');

sendLink.addEventListener('click', () => {
    wrapper.classList.remove('active-wallet', 'active-login', 'active-chart');
    wrapper.classList.add('active-send','active-popup');
});

loginLink.addEventListener('click', () => {
    wrapper.classList.remove('active-wallet', 'active-send', 'active-chart');
    wrapper.classList.add('active-login','active-popup');
});

iconClose.addEventListener('click', () => {
    wrapper.classList.remove('active-popup');
});

walletLink.addEventListener('click', () => {
    wrapper.classList.remove('active-send', 'active-login', 'active-chart');
    wrapper.classList.add('active-wallet','active-popup');
});

chartLink.addEventListener('click', () => {
    wrapper.classList.remove('active-send', 'active-login', 'active-wallet');
    wrapper.classList.add('active-chart','active-popup');
});


