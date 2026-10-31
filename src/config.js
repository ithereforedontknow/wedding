// Edit everything about the invitation here.
export const WEDDING = {
  partner1: 'Enjelaine',
  partner2: 'Erwin',
  // ISO date-time with timezone offset (this one is Philippine time, UTC+8)
  date: '2027-04-10T14:00:00+08:00',
  dateLabel: 'Saturday, April 10, 2027',
  timeLabel: '2:00 in the afternoon',
  venue: 'Casa De Hufana',
  address: 'Agoo, La Union, Philippines',
  mapUrl: 'https://maps.google.com/?q=La+Union+Philippines',
  rsvpDeadline: 'March 1, 2027',
  dressCode: 'Garden formal. Warm summer colors, linen and florals are all welcome.',
  durationHours: 6.5,

  // The personal letter shown after the hero.
  message: {
    greeting: 'Dear family and friends,',
    paragraphs: [
      'Some of our favorite days have been the quiet, golden ones: coffee on the porch, long walks in the late afternoon sun, and talking until we forgot what time it was. Somewhere in those days, we realized we had found our home in each other.',
      'Now we are getting married, and nothing would make us happier than sharing this summer day with you. You have loved us, taught us and laughed with us, and every one of you is part of our story.',
      'Please come as you are, hungry and ready to dance. We cannot wait to celebrate with you.',
    ],
    signoff: 'With all our love,',
    signature: 'Enjelaine & Erwin',
  },

  // Photos. Leave src empty to show a placeholder frame.
  // To use real photos: put them in /public/photos and set src: '/photos/prenup-1.jpg'
  // ratio is the frame shape, width/height (e.g. '4/5' portrait, '4/3' landscape).
  couplePhoto: { src: '', alt: 'Enjelaine and Erwin', label: 'Couple photo', ratio: '3/4' },
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
    { time: '1:30 PM', title: 'Guest Arrival', note: 'Welcome drinks in the garden', desc: 'Arrive, find your seat, and settle in with a welcome drink before the ceremony.', icon: 'sparkles' },
    { time: '2:00 PM', title: 'Ceremony', note: 'Garden vows', desc: 'Vows exchanged in the garden, surrounded by family and friends.', icon: 'heart' },
    { time: '2:45 PM', title: 'Aperitivo', note: 'Light bites and live music', desc: 'Light bites, cocktails, and golden-hour portraits on the lawn.', icon: 'wine' },
    { time: '4:15 PM', title: 'Dinner & Toasts', note: 'Dinner under the string lights', desc: 'A seated dinner accompanied by heartfelt toasts.', icon: 'utensils' },
    { time: '6:00 PM', title: 'Dancing', note: 'Celebrate into the night', desc: 'First dance, then dancing under the stars.', icon: 'music' },
    { time: '8:30 PM', title: 'Send-off', note: 'A sparkling farewell', desc: 'Wave goodbye as the newlyweds head into the night.', icon: 'sparkles' },
  ],
  mealOptions: ['Grilled fish', 'Roast chicken', 'Vegetarian'],
  // Optional: paste a Formspree / Getform / your own API URL to receive RSVPs.
  // Leave empty to store RSVPs in the browser only (good for a demo).
  rsvpEndpoint: '',
  coupleIllustration: { src: '/couple.svg', alt: 'Enjelaine and Erwin' },
}
