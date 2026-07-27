# TonNam SRMS — Data Flow Diagram Level 1 / แผนภาพการไหลของข้อมูลระดับ 1

```mermaid
flowchart LR
  %% External entities
  Waiter[Waiter / พนักงานเสิร์ฟ]
  Kitchen[Kitchen Staff / พนักงานครัว]
  Cashier[Cashier / พนักงานแคชเชียร์]
  Admin[Administrator / ผู้ดูแลระบบ]

  %% Processes
  P1([1.0 Authentication & Access Control<br/>การยืนยันตัวตนและควบคุมสิทธิ์])
  P2([2.0 Table, Reservation & Bill Management<br/>การจัดการโต๊ะ การจอง และบิล])
  P3([3.0 Order Management<br/>การจัดการคำสั่งอาหาร])
  P4([4.0 Kitchen Order Processing<br/>การประมวลผลคำสั่งอาหารในครัว])
  P5([5.0 Payment & Billing<br/>การชำระเงินและการเรียกเก็บเงิน])
  P6([6.0 Administration & Analytics<br/>การจัดการระบบและการวิเคราะห์ข้อมูล])
  P7([7.0 Real-time Notification Service<br/>บริการแจ้งเตือนแบบเรียลไทม์])

  %% Data stores
  D1[(Database 1: Users<br/>ข้อมูลผู้ใช้งาน)]
  D2[(Database 2: Tables & Reservations<br/>ข้อมูลโต๊ะและการจอง)]
  D3[(Database 3: Menu Catalog<br/>ข้อมูลเมนูอาหาร)]
  D4[(Database 4: Bills & Payments<br/>ข้อมูลบิลและการชำระเงิน)]
  D5[(Database 5: Orders & Order Items<br/>ข้อมูลคำสั่งอาหารและรายการอาหาร)]
  D6[(Database 6: Audit Logs<br/>ข้อมูลบันทึกการตรวจสอบ)]

  %% Authentication
  Waiter -->|Login credentials / ข้อมูลเข้าสู่ระบบ| P1
  Kitchen -->|Login credentials / ข้อมูลเข้าสู่ระบบ| P1
  Cashier -->|Login credentials / ข้อมูลเข้าสู่ระบบ| P1
  Admin -->|Login credentials / ข้อมูลเข้าสู่ระบบ| P1
  P1 <-->|User account and role data / ข้อมูลบัญชีและบทบาทผู้ใช้งาน| D1
  P1 -->|Authenticated session and permitted access / เซสชันและสิทธิ์การเข้าถึง| Waiter
  P1 -->|Authenticated session and permitted access / เซสชันและสิทธิ์การเข้าถึง| Kitchen
  P1 -->|Authenticated session and permitted access / เซสชันและสิทธิ์การเข้าถึง| Cashier
  P1 -->|Authenticated session and permitted access / เซสชันและสิทธิ์การเข้าถึง| Admin

  %% Table, reservation, and bill management
  Waiter -->|Table status, reservation, and bill request / คำขอสถานะโต๊ะ การจอง และบิล| P2
  Cashier -->|Table status, reservation, bill split, or table move request / คำขอจัดการโต๊ะ การจอง แยกบิล หรือย้ายโต๊ะ| P2
  Admin -->|Table, reservation, or bill management request / คำขอจัดการโต๊ะ การจอง หรือบิล| P2
  P2 <-->|Table and reservation data / ข้อมูลโต๊ะและการจอง| D2
  P2 <-->|Bill data / ข้อมูลบิล| D4
  P2 -->|Table, reservation, and bill details / รายละเอียดโต๊ะ การจอง และบิล| Waiter
  P2 -->|Table, reservation, and bill details / รายละเอียดโต๊ะ การจอง และบิล| Cashier
  P2 -->|Management results / ผลลัพธ์การจัดการ| Admin
  P2 -->|Sensitive change record / บันทึกการเปลี่ยนแปลงสำคัญ| D6
  P2 -->|Table, reservation, and bill updates / การอัปเดตโต๊ะ การจอง และบิล| P7

  %% Order management
  Waiter -->|Order items and notes / รายการอาหารและหมายเหตุ| P3
  Cashier -->|Order items or order change request / รายการอาหารหรือคำขอแก้ไขคำสั่งอาหาร| P3
  Admin -->|Order change request / คำขอแก้ไขคำสั่งอาหาร| P3
  P3 <-->|Available menu items and prices / รายการเมนูและราคา| D3
  P3 <-->|Open bill and total data / ข้อมูลบิลที่เปิดอยู่และยอดรวม| D4
  P3 <-->|Order and order-item data / ข้อมูลคำสั่งอาหารและรายการอาหาร| D5
  P3 -->|Order confirmation and status / การยืนยันและสถานะคำสั่งอาหาร| Waiter
  P3 -->|Order confirmation and status / การยืนยันและสถานะคำสั่งอาหาร| Cashier
  P3 -->|New or updated order / คำสั่งอาหารใหม่หรือที่อัปเดต| P4
  P3 -->|Order updates / การอัปเดตคำสั่งอาหาร| P7
  P3 -->|Sensitive change record / บันทึกการเปลี่ยนแปลงสำคัญ| D6

  %% Kitchen processing
  P4 <-->|Pending orders and order-item status / คำสั่งอาหารที่รอและสถานะรายการอาหาร| D5
  Kitchen -->|Cooked item status / สถานะรายการอาหารที่ปรุงเสร็จ| P4
  P4 -->|Kitchen order queue / คิวคำสั่งอาหารในครัว| Kitchen
  P4 -->|Updated order status / สถานะคำสั่งอาหารที่อัปเดต| P7

  %% Payment and billing
  Cashier -->|Payment method and received amount / วิธีชำระเงินและจำนวนเงินที่รับ| P5
  Admin -->|Payment request / คำขอชำระเงิน| P5
  P5 <-->|Bill total and payment record / ยอดรวมบิลและข้อมูลการชำระเงิน| D4
  P5 -->|Paid table status / สถานะโต๊ะที่ชำระแล้ว| D2
  P5 -->|Payment receipt and confirmation / ใบเสร็จและการยืนยันการชำระเงิน| Cashier
  P5 -->|Payment confirmation / การยืนยันการชำระเงิน| Admin
  P5 -->|Payment and bill updates / การอัปเดตการชำระเงินและบิล| P7
  P5 -->|Payment audit record / บันทึกการตรวจสอบการชำระเงิน| D6

  %% Administration and analytics
  Admin -->|User, menu, analytics, and audit-log request / คำขอจัดการผู้ใช้ เมนู วิเคราะห์ข้อมูล และบันทึกการตรวจสอบ| P6
  P6 <-->|User data / ข้อมูลผู้ใช้งาน| D1
  P6 <-->|Menu and availability data / ข้อมูลเมนูและสถานะการจำหน่าย| D3
  P6 <-->|Table and reservation data / ข้อมูลโต๊ะและการจอง| D2
  P6 <-->|Bill and payment data / ข้อมูลบิลและการชำระเงิน| D4
  P6 <-->|Order and order-item data / ข้อมูลคำสั่งอาหารและรายการอาหาร| D5
  P6 <-->|Audit-log data / ข้อมูลบันทึกการตรวจสอบ| D6
  P6 -->|Master-data updates, analytics, and audit trail / การอัปเดตข้อมูลหลัก ผลการวิเคราะห์ และประวัติการตรวจสอบ| Admin
  P6 -->|Menu updates / การอัปเดตเมนู| P7

  %% Real-time notifications
  P7 -->|Live table, reservation, bill, order, and menu updates / การอัปเดตโต๊ะ การจอง บิล คำสั่งอาหาร และเมนูแบบเรียลไทม์| Waiter
  P7 -->|Live order updates / การอัปเดตคำสั่งอาหารแบบเรียลไทม์| Kitchen
  P7 -->|Live table, bill, order, and menu updates / การอัปเดตโต๊ะ บิล คำสั่งอาหาร และเมนูแบบเรียลไทม์| Cashier
  P7 -->|Live operational updates / การอัปเดตการดำเนินงานแบบเรียลไทม์| Admin
```

## Diagram Explanation / คำอธิบายประกอบแผนภาพ

This Level 1 DFD decomposes the TonNam SRMS into seven major processes. It shows how staff requests are validated, processed, stored, and delivered to the relevant roles through real-time notifications.

DFD ระดับ 1 นี้แยกระบบ TonNam SRMS ออกเป็น 7 กระบวนการหลัก เพื่อแสดงการรับคำขอจากพนักงาน การตรวจสอบและประมวลผลข้อมูล การจัดเก็บข้อมูล และการแจ้งเตือนแบบเรียลไทม์ไปยังบทบาทที่เกี่ยวข้อง

### Data Collection and Processing / การรวบรวมและประมวลผลข้อมูล

- **Data collection / การรวบรวมข้อมูล:** The system receives login credentials, table and reservation requests, order items, kitchen status updates, payment details, and administration requests from staff. ระบบรับข้อมูลเข้าสู่ระบบ คำขอจัดการโต๊ะและการจอง รายการอาหาร สถานะจากครัว รายละเอียดการชำระเงิน และคำขอจัดการระบบจากพนักงาน
- **Processing / การประมวลผล:** The system verifies user access, applies restaurant business rules, updates the relevant logical data stores, records sensitive actions in the audit log, and publishes live updates to authorized users. ระบบตรวจสอบสิทธิ์ผู้ใช้งาน ใช้กฎการดำเนินงานของร้าน อัปเดตแหล่งจัดเก็บข้อมูลที่เกี่ยวข้อง บันทึกการดำเนินการสำคัญลงใน Audit Log และส่งข้อมูลอัปเดตแบบเรียลไทม์ให้ผู้ใช้ที่ได้รับสิทธิ์

### External Entities / หน่วยงานภายนอกระบบ

| Entity / หน่วยงาน | Interaction with the system / การทำงานร่วมกับระบบ |
| --- | --- |
| **Waiter / พนักงานเสิร์ฟ** | Logs in, manages table and reservation information, creates bills and orders, then receives order and table updates. เข้าสู่ระบบ จัดการข้อมูลโต๊ะและการจอง เปิดบิลและสร้างคำสั่งอาหาร จากนั้นรับข้อมูลอัปเดตของคำสั่งอาหารและโต๊ะ |
| **Kitchen Staff / พนักงานครัว** | Receives the kitchen queue and reports cooked-item status. รับคิวคำสั่งอาหารจากครัวและรายงานสถานะรายการอาหารที่ปรุงเสร็จ |
| **Cashier / พนักงานแคชเชียร์** | Manages tables and bills, accepts payment, and receives payment confirmation. จัดการโต๊ะและบิล รับชำระเงิน และรับการยืนยันผลการชำระเงิน |
| **Administrator / ผู้ดูแลระบบ** | Manages users, menus, operational data, and reviews analytics and audit logs. จัดการผู้ใช้ เมนู ข้อมูลการดำเนินงาน และตรวจสอบผลวิเคราะห์กับบันทึกการตรวจสอบ |

## Scope

This Level 1 DFD covers the staff-facing SRMS. The public marketing website is excluded because it does not currently exchange data with the API.

แผนภาพนี้ครอบคลุมระบบ SRMS สำหรับพนักงาน โดยไม่รวมเว็บไซต์ประชาสัมพันธ์ เนื่องจากปัจจุบันเว็บไซต์ไม่ได้แลกเปลี่ยนข้อมูลกับ API.
