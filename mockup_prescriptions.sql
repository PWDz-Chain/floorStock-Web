-- ==============================================================================
-- SQL Script: Mockup Prescriptions Data for FloorStock Testing (ทุกเคสสำหรับทดสอบ)
-- Database: GD4floorstock (Host: 192.168.96.20:1433)
-- Table: Prescription
-- ==============================================================================

USE [GD4floorstock];
GO

-- 1. เคลียร์ข้อมูล mockup เดิมที่เคยสร้างสำหรับทดสอบ (PrescriptionNo ขึ้นต้นด้วย 'MOCK')
DELETE FROM [dbo].[Prescription] WHERE [PrescriptionNo] LIKE 'MOCK%';
GO

DECLARE @Today DATETIME = GETDATE();
DECLARE @TodayDate DATE = CAST(GETDATE() AS DATE);

-- ==============================================================================
-- CASE 1: ใบสั่งยาปกติ รายการเดียว สต็อกพอดี (Normal Single-Item, In-Stock)
-- ผู้ป่วย: นายสมชาย สุขเกษม (HN: 6801001, AN: 6900101) - เตียง: BED-01 (W6)
-- ยา: CEFTRIAXONE IV 1 G (CTAZI1) จำนวน 1 กล่อง
-- ==============================================================================
INSERT INTO [dbo].[Prescription] (
    [PrescriptionNo], [SeqNo], [Seqmax], [Rx], [PrescriptionDate], [TakeDate],
    [Hn], [An], [PatientName], [Birthday], [Sex],
    [PriorityCode], [PriorityName],
    [DrugCd], [DrugName], [MakerNm],
    [DispensedDose], [DispensedUnitCd], [DispensedUnit],
    [DispensedTotalDose], [DispensedTotalUnitCd], [DispensedTotalUnit], [Dispense_Days],
    [InstructionCd], [InstructionName],
    [Freq_Desc_Code], [Freq_Desc], [Freq_Desc_Detail_Code], [Freq_Desc_Detail],
    [DispenseDatetime], [WardCd], [WardName], [RoomNo], [BedNo],
    [DoctorCd], [DoctorName], [DoctorComment],
    [LastModify], [Freetext1], [Freetext2], [Freetext3], [Freetext4], [Freetext5],
    [printStatus], [UnitPrice], [ChargeAmount], [voiddatetime], [InterfaceStatus]
) VALUES (
    'MOCK0101', 1, 1, 'MOCK0101', @Today, @Today,
    '6801001', '6900101', N'นายสมชาย สุขเกษม', '1985-05-12', 'M',
    '0', N'0=ปกติ (Normal)',
    'CTAZI1', N'CEF-3   CEFTRIAXONE IV 1 G', N'บ.สยามเภสัช',
    1.0, 'VIAL', N'กล่อง',
    1.0, 'VIAL', N'กล่อง', 1,
    '0001', N'ฉีดเข้าหลอดเลือดดำช้าๆ ตามแพทย์สั่ง',
    'OD', N'วันละ 1 ครั้ง', 'OD-M', N'ทุกเช้า',
    NULL, 'W6', N'ห้องจ่ายยา IPD6', '601', 'BED-01',
    'DOC001', N'นพ.เกียรติศักดิ์ พงษ์ศิริ', N'ให้ IV Drip ช้าๆ ใน 30 นาที',
    @Today, N'ฉีดเข้าหลอดเลือดดำช้าๆ ตามแพทย์สั่ง', N'วันละ 1 ครั้ง เช้า', N'Bin 103 / 303', N'ชั้น 1', N'ระวังประวัติแพ้ยากลุ่ม Cephalosporin',
    0, 45.00, 45.00, NULL, 'NEW'
);

-- ==============================================================================
-- CASE 2: ใบสั่งยาหลายรายการในใบเดียว (Multi-Item Order: 3 รายการ มีครบทุกช่อง)
-- ผู้ป่วย: นางกัลยา ใจดี (HN: 6801002, AN: 6900102) - เตียง: BED-02 (W6)
-- ยา 1/3: FORTUM -L CEFTAZIDIME 1 GM (CTZDI2)
-- ยา 2/3: LASIX-Furosemide 20 mg (FRSMI1)
-- ยา 3/3: Losec Inj 40 MG (OMPZI3)
-- ==============================================================================
INSERT INTO [dbo].[Prescription] (
    [PrescriptionNo], [SeqNo], [Seqmax], [Rx], [PrescriptionDate], [TakeDate],
    [Hn], [An], [PatientName], [Birthday], [Sex],
    [PriorityCode], [PriorityName],
    [DrugCd], [DrugName], [MakerNm],
    [DispensedDose], [DispensedUnitCd], [DispensedUnit],
    [DispensedTotalDose], [DispensedTotalUnitCd], [DispensedTotalUnit], [Dispense_Days],
    [InstructionCd], [InstructionName],
    [Freq_Desc_Code], [Freq_Desc], [Freq_Desc_Detail_Code], [Freq_Desc_Detail],
    [DispenseDatetime], [WardCd], [WardName], [RoomNo], [BedNo],
    [DoctorCd], [DoctorName], [DoctorComment],
    [LastModify], [Freetext1], [Freetext2], [Freetext3], [Freetext4], [Freetext5],
    [printStatus], [UnitPrice], [ChargeAmount], [voiddatetime], [InterfaceStatus]
) VALUES 
(
    'MOCK0201', 1, 3, 'MOCK0201', @Today, @Today,
    '6801002', '6900102', N'นางกัลยา ใจดี', '1970-08-22', 'F',
    '0', N'0=ปกติ (Normal)',
    'CTZDI2', N'FORTUM  -L  CEFTAZIDIME1 GM INJ.', N'GSK',
    1.0, 'VIAL', N'กล่อง',
    1.0, 'VIAL', N'กล่อง', 1,
    '0001', N'ฉีดเข้าหลอดเลือดดำ ทุก 8 ชั่วโมง',
    'TID', N'วันละ 3 ครั้ง', 'TID-8H', N'ทุก 8 ชั่วโมง',
    NULL, 'W6', N'ห้องจ่ายยา IPD6', '601', 'BED-02',
    'DOC002', N'พญ.วิภาวรรณ สดใส', N'ติดตามผล Cr, eGFR',
    @Today, N'ฉีด IV ทุก 8 ชม.', N'วันละ 3 ครั้ง', N'Bin 101', N'ชั้น 1', N'',
    0, 120.00, 120.00, NULL, 'NEW'
),
(
    'MOCK0201', 2, 3, 'MOCK0201', @Today, @Today,
    '6801002', '6900102', N'นางกัลยา ใจดี', '1970-08-22', 'F',
    '0', N'0=ปกติ (Normal)',
    'FRSMI1', N'(แอมพูล)-LASIX-Furosemide 20 mg INJECTION', N'Sanofi',
    1.0, 'AMP', N'กล่อง',
    1.0, 'AMP', N'กล่อง', 1,
    '0002', N'ฉีดเข้าหลอดเลือดดำช้าๆ เช้า-เย็น',
    'BID', N'วันละ 2 ครั้ง', 'BID-ME', N'เช้า-เย็น',
    NULL, 'W6', N'ห้องจ่ายยา IPD6', '601', 'BED-02',
    'DOC002', N'พญ.วิภาวรรณ สดใส', N'ประเมิน Urine output',
    @Today, N'ฉีดเข้าหลอดเลือดดำช้าๆ', N'วันละ 2 ครั้ง เช้า-เย็น', N'Bin 207', N'ชั้น 2', N'',
    0, 15.00, 15.00, NULL, 'NEW'
),
(
    'MOCK0201', 3, 3, 'MOCK0201', @Today, @Today,
    '6801002', '6900102', N'นางกัลยา ใจดี', '1970-08-22', 'F',
    '0', N'0=ปกติ (Normal)',
    'OMPZI3', N'ฉีด Losec Inj 40 MG (Omeprazole)', N'AstraZeneca',
    1.0, 'VIAL', N'กล่อง',
    1.0, 'VIAL', N'กล่อง', 1,
    '0003', N'ฉีดเข้าหลอดเลือดดำ ก่อนอาหารเช้า',
    'OD', N'วันละ 1 ครั้ง', 'OD-AC', N'ก่อนอาหารเช้า 30 นาที',
    NULL, 'W6', N'ห้องจ่ายยา IPD6', '601', 'BED-02',
    'DOC002', N'พญ.วิภาวรรณ สดใส', N'ป้องกันภาวะเลือดออกในทางเดินอาหาร',
    @Today, N'ฉีด IV ก่อนอาหารเช้า', N'วันละ 1 ครั้ง', N'Bin 604', N'ชั้น 6', N'',
    0, 65.00, 65.00, NULL, 'NEW'
);

-- ==============================================================================
-- CASE 3: ยาความเสี่ยงสูง (High Alert Drug: *H*) + STAT ด่วน
-- ผู้ป่วย: นายประสิทธิ์ วงศ์วิจิตร (HN: 6801003, AN: 6900103) - เตียง: ICU-01 (W6)
-- ยา: ADENOSINE 6MG/2ML-ADENOCOR *H* (ADNSI1)
-- ==============================================================================
INSERT INTO [dbo].[Prescription] (
    [PrescriptionNo], [SeqNo], [Seqmax], [Rx], [PrescriptionDate], [TakeDate],
    [Hn], [An], [PatientName], [Birthday], [Sex],
    [PriorityCode], [PriorityName],
    [DrugCd], [DrugName], [MakerNm],
    [DispensedDose], [DispensedUnitCd], [DispensedUnit],
    [DispensedTotalDose], [DispensedTotalUnitCd], [DispensedTotalUnit], [Dispense_Days],
    [InstructionCd], [InstructionName],
    [Freq_Desc_Code], [Freq_Desc], [Freq_Desc_Detail_Code], [Freq_Desc_Detail],
    [DispenseDatetime], [WardCd], [WardName], [RoomNo], [BedNo],
    [DoctorCd], [DoctorName], [DoctorComment],
    [LastModify], [Freetext1], [Freetext2], [Freetext3], [Freetext4], [Freetext5],
    [printStatus], [UnitPrice], [ChargeAmount], [voiddatetime], [InterfaceStatus]
) VALUES (
    'MOCK0301', 1, 1, 'MOCK0301', @Today, @Today,
    '6801003', '6900103', N'นายประสิทธิ์ วงศ์วิจิตร', '1962-11-05', 'M',
    '1', N'1=ด่วน (STAT)',
    'ADNSI1', N'ADENOSINE 6MG/2ML-ADENOCOR  *H*', N'Sanofi',
    1.0, 'AMP', N'กล่อง',
    1.0, 'AMP', N'กล่อง', 1,
    '0005', N'ฉีดเข้าหลอดเลือดดำแบบ Rapid IV push ตามด้วย NSS 20 ml',
    'STAT', N'ทันที (STAT)', 'STAT', N'ทันทีเมื่อมีอาการ PSVT',
    NULL, 'W6', N'ห้องจ่ายยา IPD6', 'ICU', 'ICU-01',
    'DOC003', N'นพ.ธีระวัฒน์ อนันตโชค (Cardiologist)', N'** High Alert Drug ** Monitor EKG อย่างใกล้ชิดขณะฉีด',
    @Today, N'Rapid IV push', N'ทันที (STAT)', N'Bin 201', N'ชั้น 2', N'ยาเสี่ยงสูง Double Check ก่อนจ่าย',
    0, 250.00, 250.00, NULL, 'NEW'
);

-- ==============================================================================
-- CASE 4: ด่วนที่สุดฉุกเฉิน (Emergency Order: PriorityCode = 2) ยาช่วยชีวิต
-- ผู้ป่วย: นางสาวพิมพา พรหมมา (HN: 6801004, AN: 6900104) - เตียง: ER-RESUS (W6)
-- ยา: DIAZEPAM INJ 10 MG/2ML (H) (DAZPI1)
-- ==============================================================================
INSERT INTO [dbo].[Prescription] (
    [PrescriptionNo], [SeqNo], [Seqmax], [Rx], [PrescriptionDate], [TakeDate],
    [Hn], [An], [PatientName], [Birthday], [Sex],
    [PriorityCode], [PriorityName],
    [DrugCd], [DrugName], [MakerNm],
    [DispensedDose], [DispensedUnitCd], [DispensedUnit],
    [DispensedTotalDose], [DispensedTotalUnitCd], [DispensedTotalUnit], [Dispense_Days],
    [InstructionCd], [InstructionName],
    [Freq_Desc_Code], [Freq_Desc], [Freq_Desc_Detail_Code], [Freq_Desc_Detail],
    [DispenseDatetime], [WardCd], [WardName], [RoomNo], [BedNo],
    [DoctorCd], [DoctorName], [DoctorComment],
    [LastModify], [Freetext1], [Freetext2], [Freetext3], [Freetext4], [Freetext5],
    [printStatus], [UnitPrice], [ChargeAmount], [voiddatetime], [InterfaceStatus]
) VALUES (
    'MOCK0401', 1, 1, 'MOCK0401', @Today, @Today,
    '6801004', '6900104', N'นางสาวพิมพา พรหมมา', '1995-03-15', 'F',
    '2', N'2=ด่วนที่สุด (Emergency)',
    'DAZPI1', N'DIAZEPAM INJ 10 MG/2ML  (H)', N'GPO',
    1.0, 'AMP', N'กล่อง',
    1.0, 'AMP', N'กล่อง', 1,
    '0006', N'ฉีดเข้าหลอดเลือดดำช้าๆ ไม่เกิน 2 mg/min',
    'STAT', N'ทันที (Emergency)', 'STAT', N'ระงับอาการชักต่อเนื่อง',
    NULL, 'W6', N'ห้องจ่ายยา IPD6', 'ER', 'ER-RESUS',
    'DOC004', N'นพ.ชัชวาล วัฒนกุล (ER Specialist)', N'ระวังการกดการหายใจ เตรียม Ambu bag พร้อมใช้งาน',
    @Today, N'ฉีด IV ช้าๆ', N'ด่วนที่สุด (Emergency)', N'Bin 402', N'ชั้น 4', N'ยาเสี่ยงสูง วัตถุออกฤทธิ์ฯ',
    0, 20.00, 20.00, NULL, 'NEW'
);

-- ==============================================================================
-- CASE 5: สั่งยามากกว่า 1 กล่อง (จำนวนสั่ง > สต็อกในตู้ที่มี 1 กล่อง) เพื่อทดสอบสต็อกไม่พอ
-- ผู้ป่วย: นายบรรจง เลิศล้ำ (HN: 6801005, AN: 6900105) - เตียง: BED-05 (W6)
-- ยา: Meropenem 1 g inj. (MRPNI4) สั่ง 2 กล่อง (ตู้มี 1 กล่อง)
-- ==============================================================================
INSERT INTO [dbo].[Prescription] (
    [PrescriptionNo], [SeqNo], [Seqmax], [Rx], [PrescriptionDate], [TakeDate],
    [Hn], [An], [PatientName], [Birthday], [Sex],
    [PriorityCode], [PriorityName],
    [DrugCd], [DrugName], [MakerNm],
    [DispensedDose], [DispensedUnitCd], [DispensedUnit],
    [DispensedTotalDose], [DispensedTotalUnitCd], [DispensedTotalUnit], [Dispense_Days],
    [InstructionCd], [InstructionName],
    [Freq_Desc_Code], [Freq_Desc], [Freq_Desc_Detail_Code], [Freq_Desc_Detail],
    [DispenseDatetime], [WardCd], [WardName], [RoomNo], [BedNo],
    [DoctorCd], [DoctorName], [DoctorComment],
    [LastModify], [Freetext1], [Freetext2], [Freetext3], [Freetext4], [Freetext5],
    [printStatus], [UnitPrice], [ChargeAmount], [voiddatetime], [InterfaceStatus]
) VALUES (
    'MOCK0501', 1, 1, 'MOCK0501', @Today, @Today,
    '6801005', '6900105', N'นายบรรจง เลิศล้ำ', '1958-12-01', 'M',
    '0', N'0=ปกติ (Normal)',
    'MRPNI4', N'Meropenem (บ.สยาม)-(L) 1 g inj.', N'บ.สยามเภสัช',
    2.0, 'VIAL', N'กล่อง',
    2.0, 'VIAL', N'กล่อง', 1,
    '0007', N'ผสม NSS 100 ml IV Drip ใน 3 ชั่วโมง',
    'Q8H', N'ทุก 8 ชั่วโมง', 'Q8H', N'ทุก 8 ชั่วโมง',
    NULL, 'W6', N'ห้องจ่ายยา IPD6', '602', 'BED-05',
    'DOC005', N'พญ.พิมพ์ชนก อริยทรัพย์', N'Extended infusion protocol',
    @Today, N'IV Drip 3 ชม.', N'ทุก 8 ชม.', N'Bin 506', N'ชั้น 5', N'สั่ง 2 กล่องเพื่อทดสอบแจ้งเตือนสต็อกไม่พอ',
    0, 380.00, 760.00, NULL, 'NEW'
);

-- ==============================================================================
-- CASE 6: ยาที่ไม่อยู่ในผัง FloorStock (Out-of-FloorStock Drug)
-- ผู้ป่วย: เด็กหญิงมะลิ หอมหวน (HN: 6801006, AN: 6900106) - เตียง: PED-01 (W6)
-- ยา: PARA500 (ไม่มีช่องในตู้)
-- ==============================================================================
INSERT INTO [dbo].[Prescription] (
    [PrescriptionNo], [SeqNo], [Seqmax], [Rx], [PrescriptionDate], [TakeDate],
    [Hn], [An], [PatientName], [Birthday], [Sex],
    [PriorityCode], [PriorityName],
    [DrugCd], [DrugName], [MakerNm],
    [DispensedDose], [DispensedUnitCd], [DispensedUnit],
    [DispensedTotalDose], [DispensedTotalUnitCd], [DispensedTotalUnit], [Dispense_Days],
    [InstructionCd], [InstructionName],
    [Freq_Desc_Code], [Freq_Desc], [Freq_Desc_Detail_Code], [Freq_Desc_Detail],
    [DispenseDatetime], [WardCd], [WardName], [RoomNo], [BedNo],
    [DoctorCd], [DoctorName], [DoctorComment],
    [LastModify], [Freetext1], [Freetext2], [Freetext3], [Freetext4], [Freetext5],
    [printStatus], [UnitPrice], [ChargeAmount], [voiddatetime], [InterfaceStatus]
) VALUES (
    'MOCK0601', 1, 1, 'MOCK0601', @Today, @Today,
    '6801006', '6900106', N'เด็กหญิงมะลิ หอมหวน', '2019-06-10', 'F',
    '0', N'0=ปกติ (Normal)',
    'PARA500_NONFLOOR', N'PARACETAMOL 500 MG TAB (ยานอกตู้ FloorStock)', N'GPO',
    1.0, 'TAB', N'เม็ด',
    1.0, 'TAB', N'เม็ด', 1,
    '0008', N'รับประทาน ครั้งละ 1/2 เม็ด เมื่อมีไข้ ทุก 4-6 ชม.',
    'PRN', N'เมื่อมีไข้', 'PRN-FEVER', N'เมื่อมีไข้สูงกว่า 38.5 C',
    NULL, 'W6', N'ห้องจ่ายยา IPD6', 'PED', 'PED-01',
    'DOC006', N'นพ.อนุชา กุมารแพทย์', N'ห้ามรับประทานเกินวันละ 4 ครั้ง',
    @Today, N'รับประทานเมื่อมีไข้', N'ทุก 4-6 ชม.', N'-', N'-', N'ยานี้ไม่ได้กำหนดไว้ในตู้ FloorStock',
    0, 1.50, 1.50, NULL, 'NEW'
);

-- ==============================================================================
-- CASE 7: ใบสั่งยาที่จัดยาเสร็จแล้ว (Already Dispensed Order - แสดงในแท็บ "จัดยาแล้ว")
-- ผู้ป่วย: นายอำนาจ มั่นคง (HN: 6801007, AN: 6900107) - เตียง: BED-07 (W6)
-- ยา: DEXAMETHASONE INJ.5MG/ML (DXMTI2)
-- ==============================================================================
INSERT INTO [dbo].[Prescription] (
    [PrescriptionNo], [SeqNo], [Seqmax], [Rx], [PrescriptionDate], [TakeDate],
    [Hn], [An], [PatientName], [Birthday], [Sex],
    [PriorityCode], [PriorityName],
    [DrugCd], [DrugName], [MakerNm],
    [DispensedDose], [DispensedUnitCd], [DispensedUnit],
    [DispensedTotalDose], [DispensedTotalUnitCd], [DispensedTotalUnit], [Dispense_Days],
    [InstructionCd], [InstructionName],
    [Freq_Desc_Code], [Freq_Desc], [Freq_Desc_Detail_Code], [Freq_Desc_Detail],
    [DispenseDatetime], [WardCd], [WardName], [RoomNo], [BedNo],
    [DoctorCd], [DoctorName], [DoctorComment],
    [LastModify], [Freetext1], [Freetext2], [Freetext3], [Freetext4], [Freetext5],
    [printStatus], [UnitPrice], [ChargeAmount], [voiddatetime], [InterfaceStatus], [userPrint]
) VALUES (
    'MOCK0701', 1, 1, 'MOCK0701', @Today, @Today,
    '6801007', '6900107', N'นายอำนาจ มั่นคง', '1975-01-20', 'M',
    '0', N'0=ปกติ (Normal)',
    'DXMTI2', N'DEXAMETHASONE INJ.5MG/ML', N'M&H',
    1.0, 'AMP', N'กล่อง',
    1.0, 'AMP', N'กล่อง', 1,
    '0009', N'ฉีดเข้าหลอดเลือดดำช้าๆ',
    'OD', N'วันละ 1 ครั้ง', 'OD-M', N'เช้า',
    DATEADD(MINUTE, -30, @Today), 'W6', N'ห้องจ่ายยา IPD6', '603', 'BED-07',
    'DOC001', N'นพ.เกียรติศักดิ์ พงษ์ศิริ', N'จ่ายยาเสร็จเรียบร้อยแล้ว',
    @Today, N'ฉีด IV ช้าๆ', N'วันละ 1 ครั้ง เช้า', N'Bin 104', N'ชั้น 1', N'ประวัติการจ่ายยาสำเร็จ',
    1, 18.00, 18.00, NULL, 'DONE', N'admin'
);

-- ==============================================================================
-- CASE 8: ใบสั่งยาที่ถูกยกเลิก (Voided / Cancelled Order)
-- ผู้ป่วย: นางศิริพร บุญเหลือ (HN: 6801008, AN: 6900108) - เตียง: BED-08 (W6)
-- ยา: PIPERACILLIN+TAZOBACTAM (PPRCI3)
-- ==============================================================================
INSERT INTO [dbo].[Prescription] (
    [PrescriptionNo], [SeqNo], [Seqmax], [Rx], [PrescriptionDate], [TakeDate],
    [Hn], [An], [PatientName], [Birthday], [Sex],
    [PriorityCode], [PriorityName],
    [DrugCd], [DrugName], [MakerNm],
    [DispensedDose], [DispensedUnitCd], [DispensedUnit],
    [DispensedTotalDose], [DispensedTotalUnitCd], [DispensedTotalUnit], [Dispense_Days],
    [InstructionCd], [InstructionName],
    [Freq_Desc_Code], [Freq_Desc], [Freq_Desc_Detail_Code], [Freq_Desc_Detail],
    [DispenseDatetime], [WardCd], [WardName], [RoomNo], [BedNo],
    [DoctorCd], [DoctorName], [DoctorComment],
    [LastModify], [Freetext1], [Freetext2], [Freetext3], [Freetext4], [Freetext5],
    [printStatus], [UnitPrice], [ChargeAmount], [voiddatetime], [InterfaceStatus]
) VALUES (
    'MOCK0801', 1, 1, 'MOCK0801', @Today, @Today,
    '6801008', '6900108', N'นางศิริพร บุญเหลือ', '1982-09-30', 'F',
    '0', N'0=ปกติ (Normal)',
    'PPRCI3', N'Piperacillin 4 g+Tazobactam 0.5 g-PIPTAM', N'บ.สยามเภสัช',
    1.0, 'VIAL', N'กล่อง',
    1.0, 'VIAL', N'กล่อง', 1,
    '0010', N'ฉีดเข้าหลอดเลือดดำ ทุก 6 ชั่วโมง',
    'Q6H', N'ทุก 6 ชั่วโมง', 'Q6H', N'ทุก 6 ชั่วโมง',
    NULL, 'W6', N'ห้องจ่ายยา IPD6', '603', 'BED-08',
    'DOC002', N'พญ.วิภาวรรณ สดใส', N'แพทย์ยกเลิกคำสั่งใช้ยา (Discontinue)',
    @Today, N'ฉีด IV ทุก 6 ชม.', N'ทุก 6 ชม.', N'Bin 606', N'ชั้น 6', N'ยกเลิกเนื่องจากเปลี่ยนแผนการรักษา',
    0, 290.00, 290.00, @Today, 'CANCEL'
);

-- ==============================================================================
-- CASE 9: ใบสั่งยาเคสผสม (5 รายการ: มีทั้งยาเสี่ยงสูง, ยาปฏิชีวนะ, ยาฉีดทั่วไป, คำเตือนยาว)
-- ผู้ป่วย: นายณรงค์เดช เกียรติไพศาล (HN: 6801009, AN: 6900109) - เตียง: VIP-801 (W6)
-- ยา 1/5: TIGECYCLINE 50 MG INJ. (TGCCI2)
-- ยา 2/5: DIGOXIN INJ 0.5 MG/2ML *H* (DGXI1)
-- ยา 3/5: FOSMICIN 2 GM INJ (FFMCI1)
-- ยา 4/5: CPM INJ.10 MG/ML (CPNRI1)
-- ยา 5/5: VIT K1 INJ.10 mg/1mL (VTKI2)
-- ==============================================================================
INSERT INTO [dbo].[Prescription] (
    [PrescriptionNo], [SeqNo], [Seqmax], [Rx], [PrescriptionDate], [TakeDate],
    [Hn], [An], [PatientName], [Birthday], [Sex],
    [PriorityCode], [PriorityName],
    [DrugCd], [DrugName], [MakerNm],
    [DispensedDose], [DispensedUnitCd], [DispensedUnit],
    [DispensedTotalDose], [DispensedTotalUnitCd], [DispensedTotalUnit], [Dispense_Days],
    [InstructionCd], [InstructionName],
    [Freq_Desc_Code], [Freq_Desc], [Freq_Desc_Detail_Code], [Freq_Desc_Detail],
    [DispenseDatetime], [WardCd], [WardName], [RoomNo], [BedNo],
    [DoctorCd], [DoctorName], [DoctorComment],
    [LastModify], [Freetext1], [Freetext2], [Freetext3], [Freetext4], [Freetext5],
    [printStatus], [UnitPrice], [ChargeAmount], [voiddatetime], [InterfaceStatus]
) VALUES 
(
    'MOCK0901', 1, 5, 'MOCK0901', @Today, @Today,
    '6801009', '6900109', N'นายณรงค์เดช เกียรติไพศาล', '1948-04-18', 'M',
    '1', N'1=ด่วน (STAT)',
    'TGCCI2', N'TIGECYCLINE 50 MG INJ.-[TYZEL]-N*', N'Pfizer',
    1.0, 'VIAL', N'กล่อง',
    1.0, 'VIAL', N'กล่อง', 1,
    '0011', N'Loading dose 100 mg then 50 mg q 12 hr IV Drip 60 min',
    'Q12H', N'ทุก 12 ชั่วโมง', 'Q12H', N'เช้า-เย็น',
    NULL, 'W6', N'ห้องจ่ายยา IPD6', 'VIP', 'VIP-801',
    'DOC007', N'ศ.นพ.ประเสริฐ วิจิตรการ', N'ผู้ป่วยติดเชื้อดื้อยา Acinetobacter baumannii (CRAB)',
    @Today, N'IV Drip ใน 60 นาที', N'ทุก 12 ชั่วโมง', N'Bin 601', N'ชั้น 6', N'ยานอกบัญชีหลัก ต้องขออนุมัติ',
    0, 1200.00, 1200.00, NULL, 'NEW'
),
(
    'MOCK0901', 2, 5, 'MOCK0901', @Today, @Today,
    '6801009', '6900109', N'นายณรงค์เดช เกียรติไพศาล', '1948-04-18', 'M',
    '1', N'1=ด่วน (STAT)',
    'DGXI1', N'ยาฉีด-DIGOXIN INJ 0.5 MG/2ML  *H*', N'GPO',
    1.0, 'AMP', N'กล่อง',
    1.0, 'AMP', N'กล่อง', 1,
    '0012', N'ฉีดเข้าหลอดเลือดดำช้าๆ อย่างน้อย 5 นาที',
    'OD', N'วันละ 1 ครั้ง', 'OD-M', N'เช้า',
    NULL, 'W6', N'ห้องจ่ายยา IPD6', 'VIP', 'VIP-801',
    'DOC007', N'ศ.นพ.ประเสริฐ วิจิตรการ', N'** High Alert Drug ** ตรวจวัด Pulse Rate ก่อนฉีด ถ้า < 60 bpm ให้ Hold ยา',
    @Today, N'ฉีด IV ช้าๆ > 5 นาที', N'วันละ 1 ครั้ง เช้า', N'Bin 206', N'ชั้น 2', N'ยาเสี่ยงสูง ตรวจสอบอัตราการเต้นหัวใจ',
    0, 25.00, 25.00, NULL, 'NEW'
),
(
    'MOCK0901', 3, 5, 'MOCK0901', @Today, @Today,
    '6801009', '6900109', N'นายณรงค์เดช เกียรติไพศาล', '1948-04-18', 'M',
    '1', N'1=ด่วน (STAT)',
    'FFMCI1', N'FOSFOmycin-FOSMICIN 2 GM INJ-ED*', N'Meiji',
    1.0, 'VIAL', N'กล่อง',
    1.0, 'VIAL', N'กล่อง', 1,
    '0013', N'ผสม NSS 100 ml IV Drip ใน 1 ชั่วโมง',
    'Q8H', N'ทุก 8 ชั่วโมง', 'Q8H', N'ทุก 8 ชั่วโมง',
    NULL, 'W6', N'ห้องจ่ายยา IPD6', 'VIP', 'VIP-801',
    'DOC007', N'ศ.นพ.ประเสริฐ วิจิตรการ', N'ใช้ร่วมกับ Tigecycline เพื่อ synergy effect',
    @Today, N'IV Drip 1 ชม.', N'ทุก 8 ชม.', N'Bin 105', N'ชั้น 1', N'',
    0, 450.00, 450.00, NULL, 'NEW'
),
(
    'MOCK0901', 4, 5, 'MOCK0901', @Today, @Today,
    '6801009', '6900109', N'นายณรงค์เดช เกียรติไพศาล', '1948-04-18', 'M',
    '1', N'1=ด่วน (STAT)',
    'CPNRI1', N'CPM INJ.10 MG/ML', N'GPO',
    1.0, 'AMP', N'กล่อง',
    1.0, 'AMP', N'กล่อง', 1,
    '0014', N'ฉีดเข้าหลอดเลือดดำช้าๆ หรือฉีดเข้ากล้ามเนื้อ',
    'PRN', N'เมื่อมีอาการคัน/แพ้', 'PRN-ITCH', N'ทุก 6 ชั่วโมง เมื่อมีอาการ',
    NULL, 'W6', N'ห้องจ่ายยา IPD6', 'VIP', 'VIP-801',
    'DOC007', N'ศ.นพ.ประเสริฐ วิจิตรการ', N'ให้เพื่อป้องกันอาการแพ้ทางผิวหนัง',
    @Today, N'ฉีด IV/IM', N'เมื่อมีอาการ', N'Bin 208', N'ชั้น 2', N'',
    0, 8.00, 8.00, NULL, 'NEW'
),
(
    'MOCK0901', 5, 5, 'MOCK0901', @Today, @Today,
    '6801009', '6900109', N'นายณรงค์เดช เกียรติไพศาล', '1948-04-18', 'M',
    '1', N'1=ด่วน (STAT)',
    'VTKI2', N'VIT K1 INJ.10 mg/1mL', N'Roche',
    1.0, 'AMP', N'กล่อง',
    1.0, 'AMP', N'กล่อง', 1,
    '0015', N'ฉีดเข้าหลอดเลือดดำช้าๆ อัตราไม่เกิน 1 mg/min',
    'STAT', N'ทันที (STAT)', 'STAT', N'ครั้งเดียวทันที',
    NULL, 'W6', N'ห้องจ่ายยา IPD6', 'VIP', 'VIP-801',
    'DOC007', N'ศ.นพ.ประเสริฐ วิจิตรการ', N'ตรวจติดตามค่า INR หลังฉีด 6-8 ชม.',
    @Today, N'ฉีด IV ช้าๆ', N'ทันที (STAT)', N'Bin 108', N'ชั้น 1', N'ระวังการเกิด Anaphylactoid reaction',
    0, 35.00, 35.00, NULL, 'NEW'
);
GO
