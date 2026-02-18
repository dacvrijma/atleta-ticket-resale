import { ResaleRegistration } from "@/types/resale"

export const mockRegistrations: ResaleRegistration[] = [
  {
    id: "SdUEqREcGTHk",
    resale: {
      id: "SdUEqREcGTHk",
      resellable: true,
      available: true,
      amount: 4200,
      total_amount: 4200,
      fee: 210,
      public_url:
        "https://atleta.cc/e/SdUE6lPR70dK/resale/SdUEqREcGTHk/eyJpdiI6Inh3U1N0VHhUQ1c1ejBMNWgvU3Y2RXc9PSIsInZhbHVlIjoiTlMrQWtaVmN6bXVYenJ3TTVJVmo2Nk1OTTMxckF6QUpWRTJFa1JLTyszaEVTUGxTSGN4SGJwbDV1NnNKSUVIelk1VDBqRzFLSGM5enI1emdQUXhkTzA1RDk5bFNFdTlWUmVLbitaQkp2a25ZdkljYVhpZllxcHcrM1h6T28zRDMiLCJtYWMiOiJhYWVhZWE3NDQ4NWUwYTQ2YzgxNmRjNmZjNWU4MDY4MGVjYjljZDEyZWYzYmQ4Y2UzMmQ5Mjg4NTA1NjFkMDZiIiwidGFnIjoiIn0%3D",
      public_token:
        "eyJpdiI6Im9wY1dMMXFmWk9aMDRCbEk1bGt4cFE9PSIsInZhbHVlIjoiMXlRc1NEQTdYVlBXTGZoSmFWYzBRWkl3aHJvOHB6YTJjNjRlajcvMmZ1eTBPRUt1enhoMFcyNFhNVzJVdUkvcVVJN0U1aU9vdGFuRUZ5UXlqb1pJWlA0SE80MzBkR0J5eXJmRUZYSTZQaG1xWXlaWWdvZ0pzY3pXV05ETkNKTTQiLCJtYWMiOiIwNTM5NzI2ZWQ3OTA4OTI0M2VjMzgxY2MxODZkZDE1ZTAwY2VmYjIxYmM2YzVmZDE2MzU4ODkwMzAzY2U4MjIzIiwidGFnIjoiIn0%3D",
      time_left: null,
      total_time: 600,
      upgrades: [],
    },
    required_attributes: [
      "date_of_birth",
      "gender",
      "nationality",
      "address",
      "phone",
      "emergency_phone",
    ],
    start_time: null,
    corral_name: null,
    ticket: {
      id: "SdUESTK5AEUS",
      title: "MEN SOLO HEAVY",
      units: 1,
      description:
        "<p>Register now with early bird discount. Prices will increase to €100.</p>",
      business: false,
      image: {
        id: "SdUE45UdAiQu",
        url: "https://cdn.atleta.cc/SdUE/SdUESTK5AEUS/grSfmZvU9TvkD84ivpVu97UV0DeFtjVhor6nzrx0.jpg",
      },
    },
    promotion: {
      id: "SdUE4KLNF9W2",
      title: "GYMRACE",
    },
    time_slot: {
      id: "SdUEB1SOHj3K",
      start_date: "2026-03-01",
      start_time: "09:10:00",
      title: null,
      multi_date: true,
    },
  },
  {
    id: "SdUEqREcGTH2",
    resale: {
      id: "SdUEqREcGTH2",
      resellable: true,
      available: true,
      amount: 3500,
      total_amount: 3500,
      fee: 175,
      public_url:
        "https://atleta.cc/e/SdUE6lPR70dK/resale/SdUEqREcGTH2/token2",
      public_token: "token2",
      time_left: null,
      total_time: 600,
      upgrades: [],
    },
    required_attributes: ["date_of_birth", "gender"],
    start_time: null,
    corral_name: null,
    ticket: {
      id: "SdUESTK5AEU2",
      title: "WOMEN SOLO",
      units: 1,
      description: "<p>Women solo category</p>",
      business: false,
      image: null,
    },
    promotion: {
      id: "SdUE4KLNF9W2",
      title: "GYMRACE",
    },
    time_slot: {
      id: "SdUEB1SOHj3L",
      start_date: "2026-03-01",
      start_time: "10:30:00",
      title: null,
      multi_date: false,
    },
  },
  {
    id: "SdUEqREcGTH3",
    resale: {
      id: "SdUEqREcGTH3",
      resellable: true,
      available: false,
      amount: 5000,
      total_amount: 5000,
      fee: 250,
      public_url:
        "https://atleta.cc/e/SdUE6lPR70dK/resale/SdUEqREcGTH3/token3",
      public_token: "token3",
      time_left: null,
      total_time: 600,
      upgrades: [],
    },
    required_attributes: [],
    start_time: null,
    corral_name: null,
    ticket: {
      id: "SdUESTK5AEU3",
      title: "DUO TEAM",
      units: 2,
      description: "<p>Duo team category — sold out</p>",
      business: false,
      image: null,
    },
    promotion: {
      id: "SdUE4KLNF9W2",
      title: "GYMRACE",
    },
    time_slot: {
      id: "SdUEB1SOHj3M",
      start_date: "2026-03-01",
      start_time: "11:00:00",
      title: null,
      multi_date: false,
    },
  },
]
