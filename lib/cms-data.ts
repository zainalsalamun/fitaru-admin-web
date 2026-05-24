export const users = [
  {
    name: "Raka Pratama",
    contact: "raka@email.com",
    goal: "Turun berat badan",
    status: "Active",
    lastActive: "Hari ini",
  },
  {
    name: "Dina Rahma",
    contact: "dina@email.com",
    goal: "Jaga berat badan",
    status: "Active",
    lastActive: "Kemarin",
  },
  {
    name: "Bayu Saputra",
    contact: "bayu@email.com",
    goal: "Hidup lebih sehat",
    status: "Suspended",
    lastActive: "7 hari lalu",
  },
];

export const foodItems = [
  {
    name: "Nasi ayam",
    category: "Makanan rumahan",
    portion: "Sedang",
    calories: "520 kkal",
    status: "Active",
  },
  {
    name: "Bakso",
    category: "Makanan luar",
    portion: "Sedang",
    calories: "430 kkal",
    status: "Active",
  },
  {
    name: "Kopi susu",
    category: "Minuman",
    portion: "Sedang",
    calories: "180 kkal",
    status: "Review",
  },
];

export const exerciseItems = [
  {
    name: "Jalan kaki",
    category: "Walking",
    intensity: "Sedang",
    duration: "30 menit",
    calories: "110 kkal",
    status: "Active",
  },
  {
    name: "Workout rumah",
    category: "Home workout",
    intensity: "Sedang",
    duration: "20 menit",
    calories: "140 kkal",
    status: "Active",
  },
  {
    name: "Yoga ringan",
    category: "Yoga",
    intensity: "Ringan",
    duration: "30 menit",
    calories: "90 kkal",
    status: "Draft",
  },
];

export const notifications = [
  {
    title: "Jangan lupa catat makan siang",
    segment: "Belum catat makan hari ini",
    schedule: "Hari ini, 12:00",
    status: "Scheduled",
  },
  {
    title: "Minum air dulu pelan-pelan",
    segment: "Semua user aktif",
    schedule: "Hari ini, 15:00",
    status: "Draft",
  },
  {
    title: "Review mingguan siap",
    segment: "User aktif 7 hari",
    schedule: "Minggu, 19:00",
    status: "Sent",
  },
];

export const settings = [
  {
    label: "Target air default",
    value: "8 gelas / hari",
    description: "Dipakai saat user pertama kali setup target harian.",
  },
  {
    label: "Target olahraga default",
    value: "3x / minggu",
    description: "Rekomendasi awal untuk user baru.",
  },
  {
    label: "Jadwal timbang default",
    value: "Senin & Kamis pagi",
    description: "Reminder timbang berat badan yang disarankan.",
  },
  {
    label: "Maintenance banner",
    value: "Nonaktif",
    description: "Banner pengumuman di aplikasi mobile.",
  },
];
