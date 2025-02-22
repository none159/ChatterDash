import { hostname } from "os";

module.exports = {
  middleware: true,  // This enables middleware for Next.js
  images:{
    remotePatterns :[
      {
        hostname :"lh3.googleusercontent.com",
        protocol :"https"
    },
    {
      hostname :"avatars.githubusercontent.com",
      protocol :"https"
  },{
    hostname:"bbkpjrnraermllvdjhno.supabase.co",
    protocol:"https"
  }
  ]
  // Remove the experimental flag for middleware
}
}
