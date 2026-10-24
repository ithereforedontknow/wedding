// Edit everything about the invitation here.
export const WEDDING = {
  partner1: 'Isabelle',
  partner2: 'Mateo',
  // ISO date-time with timezone offset (this one is Philippine time, UTC+8)
  date: '2027-06-12T16:00:00+08:00',
  dateLabel: 'Saturday, June 12, 2027',
  timeLabel: '4:00 in the afternoon',
  venue: 'The Garden Pavilion',
  address: 'La Union, Philippines',
  mapUrl: 'https://maps.google.com/?q=La+Union+Philippines',
  rsvpDeadline: 'May 1, 2027',
  dressCode: 'Garden formal. Warm summer colors, linen and florals are all welcome.',

  // The personal letter shown after the hero.
  message: {
    greeting: 'Dear family and friends,',
    paragraphs: [
      'Some of our favorite days have been the quiet, golden ones: coffee on the porch, long walks in the late afternoon sun, and talking until we forgot what time it was. Somewhere in those days, we realized we had found our home in each other.',
      'Now we are getting married, and nothing would make us happier than sharing this summer day with you. You have loved us, taught us and laughed with us, and every one of you is part of our story.',
      'Please come as you are, hungry and ready to dance. We cannot wait to celebrate with you.',
    ],
    signoff: 'With all our love,',
    signature: 'Isabelle & Mateo',
  },

  // Photos. Leave src empty to show a placeholder frame.
  // To use real photos: put them in /public/photos and set src: '/photos/prenup-1.jpg'
  // ratio is the frame shape, width/height (e.g. '4/5' portrait, '4/3' landscape).
  couplePhoto: { src: '', alt: 'Isabelle and Mateo', label: 'Couple photo', ratio: '3/4' },
  gallery: [
    { src: '', alt: 'Prenup photo 1', label: 'Prenup photo 1', caption: 'Golden hour', ratio: '4/5' },
    { src: '', alt: 'Prenup photo 2', label: 'Prenup photo 2', caption: 'Among the sunflowers', ratio: '4/3' },
    { src: '', alt: 'Prenup photo 3', label: 'Prenup photo 3', caption: 'The long walk home', ratio: '4/5' },
    { src: '', alt: 'Prenup photo 4', label: 'Prenup photo 4', caption: 'Laughing', ratio: '1/1' },
    { src: '', alt: 'Prenup photo 5', label: 'Prenup photo 5', caption: 'By the water', ratio: '4/5' },
    { src: '', alt: 'Prenup photo 6', label: 'Prenup photo 6', caption: 'Just the two of us', ratio: '4/3' },
  ],

  // icon: sparkles | heart | wine | utensils | music
  schedule: [
    { time: '3:30 PM', title: 'Guest Arrival', note: 'Welcome drinks among the blooms', icon: 'sparkles' },
    { time: '4:00 PM', title: 'Ceremony', note: 'Garden vows', icon: 'heart' },
    { time: '5:00 PM', title: 'Cocktail Hour', note: 'Light bites and live music', icon: 'wine' },
    { time: '6:30 PM', title: 'Dinner & Toasts', note: 'Dinner under the string lights', icon: 'utensils' },
    { time: '8:00 PM', title: 'Dancing', note: 'Celebrate into the night', icon: 'music' },
  ],
  mealOptions: ['Grilled fish', 'Roast chicken', 'Vegetarian'],
  // Optional: paste a Formspree / Getform / your own API URL to receive RSVPs.
  // Leave empty to store RSVPs in the browser only (good for a demo).
  rsvpEndpoint: '',
}
