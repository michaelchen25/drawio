# Biomed Tooltip Review

## Purpose

This file is the domain-review checklist for `T-112`. The ISO 5807 tooltip set is already marked ready in `src/main/webapp/custom-libraries/tooltips.json`; the biomed sections below remain draft until reviewed by the project owner or a domain expert.

Review action:
- Put `OK` in the Review column when the tooltip is acceptable.
- Put revised text in the Revised tooltip column when the wording should change.
- Keep each tooltip short enough for sidebar hover use.

## Review Status

| Area | Status |
|---|---|
| ISO 5807 | ready |
| Biomed tooltips | draft-needs-domain-review |

## Quality System

| ID | Draft tooltip | Review | Revised tooltip |
|---|---|---|---|
| change-control-impact | 變更管制的影響範圍判斷。先用 Decision 分流，再引用既定審查 SOP。 |  |  |
| change-control-review | 變更審查既定流程。用於影響評估、核准與執行追蹤的 SOP 子流程。 |  |  |
| deviation-investigation | 偏差調查既定流程。用於事件紀錄、根因分析、影響評估與結案。 |  |  |
| capa | CAPA 既定流程。用於根因分析後的矯正預防措施、執行與效果確認。 |  |  |
| oos-oot-investigation | OOS/OOT 調查既定流程。用於超規格或趨勢外結果的實驗室/製程調查。 |  |  |
| risk-high | 風險等級判斷。用於分流高風險事件、變更或偏差的處置路徑。 |  |  |
| qa-approval | QA/QP 是否核准的決策點。用 Decision 表示 yes/no 分支。 |  |  |
| qp-release-signature | 人工核准或簽署動作。例：QP 簽署放行，屬不可自動化人工作業。 |  |  |
| document-control | 文件管制既定流程。用於文件建立、審查、核准、發行與作廢。 |  |  |
| record-archive | 紀錄歸檔或系統登錄。用於批次紀錄、檢驗結果或品質紀錄保存。 |  |  |

## Lab Templates

| ID | Draft tooltip | Review | Revised tooltip |
|---|---|---|---|
| flow-cytometry | 流式細胞術流程模板。涵蓋染色、孵育、上機讀取、gating 與報告輸出。 |  |  |
| western-blot | Western blot 流程模板。涵蓋裂解、定量、電泳、轉印、抗體孵育、顯影與判讀。 |  |  |
| t-cell-cytotoxicity | T 細胞毒殺試驗模板。涵蓋 E:T 比例設定、共培養、孵育、測量與閾值判斷。 |  |  |
| elisa | ELISA 流程模板。涵蓋包被、封閉、加樣、孵育、呈色、讀盤與標準曲線判斷。 |  |  |
| gene-cloning | 基因選殖流程模板。涵蓋 PCR、酶切/接合、轉形、培養、挑菌、定序確認。 |  |  |
| transfection-transduction | 轉染/轉導流程模板。涵蓋細胞鋪盤、複合物或病毒準備、孵育、效率測量與篩選。 |  |  |
| protein-purification | 蛋白純化流程模板。涵蓋澄清、親和層析、洗脫、換液、純度判斷與 QC 報告。 |  |  |

## Antibody Process

| ID | Draft tooltip | Review | Revised tooltip |
|---|---|---|---|
| cell-line-development | 細胞株開發既定流程。用於篩選高表現細胞株與建立生產株。 |  |  |
| seed-train | 種子擴增步驟。用於逐級放大細胞，銜接生物反應器生產。 |  |  |
| bioreactor-culture | 細胞培養/生物反應器。用於細胞擴增與抗體生產。 |  |  |
| harvest | 收穫步驟。用於分離細胞與上清，銜接下游純化。 |  |  |
| clarification | 澄清步驟。用離心或深層過濾去除細胞與碎片。 |  |  |
| protein-a-capture | Protein A 捕獲既定流程。用於抗體親和層析平台步驟。 |  |  |
| intermediate-polishing-chromatography | 中間/精製層析既定流程。用於離子交換或疏水層析等純化步驟。 |  |  |
| viral-clearance-filtration | 病毒清除/過濾既定流程。用於病毒安全性控制，屬法規關鍵步驟。 |  |  |
| bds-filtration | 原料藥過濾步驟。用於最終 BDS 過濾與進入配方前處理。 |  |  |
| formulation | 配方步驟。用於調整成最終配方條件。 |  |  |
| fill-finish | 無菌充填步驟。用於無菌條件下充填成品。 |  |  |
| qc-testing | QC 檢驗既定流程。用於依既定 SOP 完成放行檢驗。 |  |  |
| batch-release | 批次放行決策。用於 QA/QP 判斷是否放行。 |  |  |
| cryopreservation | 冷凍保存步驟。用於低溫保存中間品或最終產品。 |  |  |
| cold-chain-shipping | 冷鏈運輸步驟。用於溫控條件下配送或轉運。 |  |  |

## CAR-T Process

| ID | Draft tooltip | Review | Revised tooltip |
|---|---|---|---|
| leukapheresis | 白血球分離術。從病人血液採集 PBMC，作為自體 CAR-T 起始物。 |  |  |
| cold-chain-shipping | 冷鏈運輸步驟。用於病人材料或產品的溫控轉運。 |  |  |
| thaw | 解凍步驟。用於冷凍起始物或中間品回到可操作狀態。 |  |  |
| t-cell-enrichment | T 細胞富集/選別既定流程。通常使用免疫磁珠選別 T 細胞。 |  |  |
| t-cell-activation | T 細胞活化步驟。例：anti-CD3/CD28 活化，準備進入基因導入。 |  |  |
| viral-transduction | 病毒轉導步驟。用病毒載體導入 CAR 基因。 |  |  |
| ex-vivo-expansion | Ex vivo 擴增步驟。培養擴增 7-14 天，常搭配 Delay 表示等待。 |  |  |
| formulation | 配方步驟。用於調整細胞產品至最終配方。 |  |  |
| drug-product-fill | 製劑充填入袋。用於將 DS/DP 充填至輸注袋。 |  |  |
| qc-testing | QC 檢驗既定流程。用於依既定 SOP 完成放行檢驗。 |  |  |
| batch-release | 批次放行決策。用於 QA/QP 判斷是否放行。 |  |  |
| cryopreservation | 冷凍保存步驟。用於低溫保存 CAR-T 細胞產品。 |  |  |
| infusion | 回輸給病人的流程終點。用 Terminator 表示 CAR-T 自體流程結束。 |  |  |
