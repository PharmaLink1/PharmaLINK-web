import type { Medicine } from "@/lib/types/medicine";

export const mockMedicines: Medicine[] = [
  {
    id: "med_1",
    genericName: "Paracetamol",
    brandNames: ["Panadol", "Fevadol"],
    category: "Analgesic",
    requiresPrescription: false,
  },
  {
    id: "med_2",
    genericName: "Amoxicillin",
    brandNames: ["Amoxil"],
    category: "Antibiotic",
    requiresPrescription: true,
  },
  {
    id: "med_3",
    genericName: "Metformin",
    brandNames: ["Glucophage"],
    category: "Antidiabetic",
    requiresPrescription: true,
  },
];
