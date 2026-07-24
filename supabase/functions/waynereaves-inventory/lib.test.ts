import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { normalizeInventoryRow } from "./lib.ts";

Deno.test("normalizeInventoryRow maps common vehicle fields into cache columns", () => {
  const row = normalizeInventoryRow({
    VIN: "1HGCM82633A004352",
    StockNumber: "A12345",
    Year: "2022",
    Make: "Honda",
    Model: "Accord",
    Price: "28995",
    Mileage: "18420",
    FuelType: "Hybrid",
    Transmission: "CVT",
    Engine: "2.0L I4",
    Drivetrain: "FWD",
    ExteriorColor: "Blue",
    InteriorColor: "Black",
    Description: "Great commuter car",
    Photos: { Photo: [{ URL: "https://cdn.example/1.jpg" }] },
    Features: { Feature: ["Backup Camera", "Heated Seats"] },
  });

  assertEquals(row.vin, "1HGCM82633A004352");
  assertEquals(row.stock_number, "A12345");
  assertEquals(row.year, 2022);
  assertEquals(row.make, "Honda");
  assertEquals(row.model, "Accord");
  assertEquals(row.price, 28995);
  assertEquals(row.mileage, 18420);
  assertEquals(row.fuel, "Hybrid");
  assertEquals(row.transmission, "CVT");
  assertEquals(row.engine, "2.0L I4");
  assertEquals(row.drivetrain, "FWD");
  assertEquals(row.color_exterior, "Blue");
  assertEquals(row.color_interior, "Black");
  assertEquals(row.description, "Great commuter car");
  assertEquals(row.features.length, 2);
  assertEquals(row.photos.length, 1);
  assertEquals(row.image, "https://cdn.example/1.jpg");
});
