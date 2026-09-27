package com.swarnikacare.billing.dto;
import com.swarnikacare.billing.entity.InvoiceItem;
import java.math.BigDecimal;
import java.time.LocalDateTime;
public class InvoiceItemResponse {
    private Long id;
    private String itemType;
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal discount;
    private BigDecimal taxRate;
    private BigDecimal lineTotal;
    private LocalDateTime createdAt;
    public static InvoiceItemResponse fromEntity(InvoiceItem item) {
        InvoiceItemResponse r = new InvoiceItemResponse();
        r.id = item.getId(); r.itemType = item.getItemType(); r.description = item.getDescription();
        r.quantity = item.getQuantity(); r.unitPrice = item.getUnitPrice(); r.discount = item.getDiscount();
        r.taxRate = item.getTaxRate(); r.lineTotal = item.getLineTotal(); r.createdAt = item.getCreatedAt();
        return r;
    }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getItemType() { return itemType; } public void setItemType(String s) { this.itemType = s; }
    public String getDescription() { return description; } public void setDescription(String d) { this.description = d; }
    public Integer getQuantity() { return quantity; } public void setQuantity(Integer q) { this.quantity = q; }
    public BigDecimal getUnitPrice() { return unitPrice; } public void setUnitPrice(BigDecimal u) { this.unitPrice = u; }
    public BigDecimal getDiscount() { return discount; } public void setDiscount(BigDecimal d) { this.discount = d; }
    public BigDecimal getTaxRate() { return taxRate; } public void setTaxRate(BigDecimal t) { this.taxRate = t; }
    public BigDecimal getLineTotal() { return lineTotal; } public void setLineTotal(BigDecimal l) { this.lineTotal = l; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime c) { this.createdAt = c; }
}
