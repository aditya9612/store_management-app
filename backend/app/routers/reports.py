from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Any
from datetime import datetime, timedelta
from io import BytesIO
import json
from app import models, database
from app.response_structure import OnSuccess

router = APIRouter(prefix="/admin/reports", tags=["Admin Reports"])

@router.get("/overview", response_model=OnSuccess[Dict[str, Any]])
def get_reports_overview(
    period: str = "all_time",  # all_time, last_7_days, last_30_days, last_quarter, last_year
    db: Session = Depends(database.get_db)
):
    """
    Get comprehensive reports overview with all statistics
    """
    try:
        # Calculate date filter based on period
        date_filter = None
        if period == "last_7_days":
            date_filter = datetime.now() - timedelta(days=7)
        elif period == "last_30_days":
            date_filter = datetime.now() - timedelta(days=30)
        elif period == "last_quarter":
            date_filter = datetime.now() - timedelta(days=90)
        elif period == "last_year":
            date_filter = datetime.now() - timedelta(days=365)
        
        # Get all shops with their details
        shops_query = db.query(models.Store).all()
        
        # Get all orders (with date filter if applicable)
        orders_query = db.query(models.Order)
        if date_filter:
            orders_query = orders_query.filter(models.Order.created_at >= date_filter)
        all_orders = orders_query.all()
        
        # Get all products
        all_products = db.query(models.Product).all()
        
        # Get all customers
        all_customers = db.query(models.Customer).all()
        
        # Calculate overall statistics
        total_revenue = sum(order.total - order.discount for order in all_orders)
        total_orders = len(all_orders)
        total_shops = len(shops_query)
        active_shops = len([s for s in shops_query if s.status == 'active'])
        inactive_shops = len([s for s in shops_query if s.status == 'inactive'])
        suspended_shops = len([s for s in shops_query if s.status == 'suspended'])
        total_products = len(all_products)
        total_customers = len(all_customers)
        
        # Calculate average per sale
        avg_per_sale = total_revenue / total_orders if total_orders > 0 else 0
        
        # Get shop-wise breakdown
        shop_breakdown = []
        for shop in shops_query:
            # Get orders for this shop
            shop_orders_query = db.query(models.Order).filter(models.Order.store_id == shop.id)
            if date_filter:
                shop_orders_query = shop_orders_query.filter(models.Order.created_at >= date_filter)
            shop_orders = shop_orders_query.all()
            
            # Get products for this shop
            shop_products = db.query(models.Product).filter(models.Product.store_id == shop.id).all()
            
            # Get customers for this shop
            shop_customers = db.query(models.Customer).filter(models.Customer.store_id == shop.id).all()
            
            # Calculate shop revenue
            shop_revenue = sum(order.total - order.discount for order in shop_orders)
            
            shop_breakdown.append({
                "shop_id": shop.id,
                "shop_name": shop.name,
                "owner_id": shop.owner_id,
                "owner_name": shop.owner.name if shop.owner else "Unknown",
                "status": shop.status,
                "address": shop.address,
                "city": shop.city,
                "state": shop.state,
                "total_orders": len(shop_orders),
                "total_revenue": round(shop_revenue, 2),
                "total_products": len(shop_products),
                "total_customers": len(shop_customers),
                "avg_order_value": round(shop_revenue / len(shop_orders), 2) if len(shop_orders) > 0 else 0
            })
        
        # Sort by revenue
        shop_breakdown.sort(key=lambda x: x['total_revenue'], reverse=True)
        
        # Get owner performance breakdown
        owners = db.query(models.Owner).all()
        owner_breakdown = []
        for owner in owners:
            owner_shops = db.query(models.Store).filter(models.Store.owner_id == owner.id).all()
            active_count = len([s for s in owner_shops if s.status == 'active'])
            inactive_count = len([s for s in owner_shops if s.status == 'inactive'])
            suspended_count = len([s for s in owner_shops if s.status == 'suspended'])
            
            # Calculate total revenue for all owner's shops
            owner_revenue = 0
            owner_orders = 0
            for shop in owner_shops:
                shop_orders_query = db.query(models.Order).filter(models.Order.store_id == shop.id)
                if date_filter:
                    shop_orders_query = shop_orders_query.filter(models.Order.created_at >= date_filter)
                shop_orders = shop_orders_query.all()
                owner_orders += len(shop_orders)
                owner_revenue += sum(order.total - order.discount for order in shop_orders)
            
            success_rate = (active_count / len(owner_shops) * 100) if len(owner_shops) > 0 else 0
            
            owner_breakdown.append({
                "owner_id": owner.id,
                "owner_name": owner.name,
                "email": owner.email,
                "mobile": owner.mobile,
                "total_shops": len(owner_shops),
                "active_shops": active_count,
                "inactive_shops": inactive_count,
                "suspended_shops": suspended_count,
                "success_rate": round(success_rate, 2),
                "total_revenue": round(owner_revenue, 2),
                "total_orders": owner_orders,
                "status": "excellent" if success_rate >= 80 else "good" if success_rate >= 60 else "needs_attention"
            })
        
        # Get recent orders with details
        recent_orders_query = db.query(models.Order).order_by(desc(models.Order.created_at)).limit(10)
        recent_orders = []
        for order in recent_orders_query.all():
            recent_orders.append({
                "order_id": order.id,
                "customer_name": order.customer.name if order.customer else "Unknown",
                "customer_phone": order.customer.phone if order.customer else "N/A",
                "shop_name": order.store.name if order.store else "Unknown",
                "shop_id": order.store_id,
                "total": round(order.total - order.discount, 2),
                "status": order.status,
                "created_at": order.created_at.isoformat() if order.created_at else None,
                "items_count": len(order.items) if order.items else 0
            })
        
        # Get top products
        top_products_query = db.query(
            models.OrderItem.product_id,
            models.Product.name,
            models.Product.price,
            models.Product.store_id,
            func.sum(models.OrderItem.quantity).label('total_sold'),
            func.sum(models.OrderItem.quantity * models.OrderItem.price).label('total_revenue')
        ).join(
            models.Product, models.OrderItem.product_id == models.Product.id
        ).group_by(
            models.OrderItem.product_id, models.Product.name, models.Product.price, models.Product.store_id
        ).order_by(
            desc('total_sold')
        ).limit(10)
        
        top_products = []
        for product in top_products_query.all():
            shop = db.query(models.Store).filter(models.Store.id == product.store_id).first()
            top_products.append({
                "product_id": product.product_id,
                "product_name": product.name,
                "price": round(product.price, 2),
                "total_sold": product.total_sold,
                "total_revenue": round(product.total_revenue, 2),
                "shop_name": shop.name if shop else "Unknown",
                "shop_id": product.store_id
            })
        
        # Calculate growth trends (mock for now, would need historical data)
        # For a real implementation, you'd track these metrics over time
        growth_trends = {
            "shops_growth": {
                "current_period": total_shops,
                "previous_period": max(0, total_shops - 3),
                "growth_percentage": 15.0
            },
            "owners_growth": {
                "current_period": len(owners),
                "previous_period": max(0, len(owners) - 2),
                "growth_percentage": 12.0
            },
            "activation_rate": {
                "current_period": round((active_shops / total_shops * 100) if total_shops > 0 else 0, 2),
                "previous_period": 75.0,
                "growth_percentage": 8.0
            }
        }
        
        return OnSuccess(
            data={
                "period": period,
                "overall_stats": {
                    "total_revenue": round(total_revenue, 2),
                    "total_orders": total_orders,
                    "total_shops": total_shops,
                    "active_shops": active_shops,
                    "inactive_shops": inactive_shops,
                    "suspended_shops": suspended_shops,
                    "total_products": total_products,
                    "total_customers": total_customers,
                    "total_owners": len(owners),
                    "avg_per_sale": round(avg_per_sale, 2)
                },
                "shop_breakdown": shop_breakdown,
                "owner_breakdown": owner_breakdown,
                "recent_orders": recent_orders,
                "top_products": top_products,
                "growth_trends": growth_trends
            },
            message="Reports overview fetched successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/shops", response_model=OnSuccess[List[Dict[str, Any]]])
def get_shop_reports(db: Session = Depends(database.get_db)):
    """
    Get detailed shop-wise reports
    """
    try:
        shops = db.query(models.Store).all()
        shop_reports = []
        
        for shop in shops:
            # Get all metrics for this shop
            orders = db.query(models.Order).filter(models.Order.store_id == shop.id).all()
            products = db.query(models.Product).filter(models.Product.store_id == shop.id).all()
            customers = db.query(models.Customer).filter(models.Customer.store_id == shop.id).all()
            
            total_revenue = sum(order.total - order.discount for order in orders)
            
            shop_reports.append({
                "shop_id": shop.id,
                "shop_name": shop.name,
                "owner_name": shop.owner.name if shop.owner else "Unknown",
                "status": shop.status,
                "location": f"{shop.city}, {shop.state}" if shop.city and shop.state else shop.address,
                "total_orders": len(orders),
                "total_revenue": round(total_revenue, 2),
                "total_products": len(products),
                "total_customers": len(customers),
                "avg_order_value": round(total_revenue / len(orders), 2) if len(orders) > 0 else 0,
                "gstin": shop.gstin
            })
        
        return OnSuccess(data=shop_reports, message="Shop reports fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/revenue", response_model=OnSuccess[Dict[str, Any]])
def get_revenue_report(db: Session = Depends(database.get_db)):
    """
    Get detailed revenue reports
    """
    try:
        # Get all orders
        orders = db.query(models.Order).all()
        
        # Calculate total revenue
        total_revenue = sum(order.total - order.discount for order in orders)
        total_discount = sum(order.discount for order in orders)
        gross_revenue = sum(order.total for order in orders)
        
        # Get revenue by shop
        shops = db.query(models.Store).all()
        revenue_by_shop = []
        
        for shop in shops:
            shop_orders = db.query(models.Order).filter(models.Order.store_id == shop.id).all()
            shop_revenue = sum(order.total - order.discount for order in shop_orders)
            
            revenue_by_shop.append({
                "shop_id": shop.id,
                "shop_name": shop.name,
                "revenue": round(shop_revenue, 2),
                "orders_count": len(shop_orders),
                "avg_order_value": round(shop_revenue / len(shop_orders), 2) if len(shop_orders) > 0 else 0
            })
        
        # Sort by revenue
        revenue_by_shop.sort(key=lambda x: x['revenue'], reverse=True)
        
        return OnSuccess(
            data={
                "total_revenue": round(total_revenue, 2),
                "gross_revenue": round(gross_revenue, 2),
                "total_discount": round(total_discount, 2),
                "total_orders": len(orders),
                "avg_order_value": round(total_revenue / len(orders), 2) if len(orders) > 0 else 0,
                "revenue_by_shop": revenue_by_shop
            },
            message="Revenue report fetched successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/inventory", response_model=OnSuccess[Dict[str, Any]])
def get_inventory_report(db: Session = Depends(database.get_db)):
    """
    Get detailed inventory reports
    """
    try:
        # Get all products
        products = db.query(models.Product).all()
        
        total_products = len(products)
        total_value = sum(product.price for product in products)
        
        # Get inventory by shop
        shops = db.query(models.Store).all()
        inventory_by_shop = []
        
        for shop in shops:
            shop_products = db.query(models.Product).filter(models.Product.store_id == shop.id).all()
            shop_inventory_value = sum(product.price for product in shop_products)
            
            inventory_by_shop.append({
                "shop_id": shop.id,
                "shop_name": shop.name,
                "products_count": len(shop_products),
                "inventory_value": round(shop_inventory_value, 2)
            })
        
        return OnSuccess(
            data={
                "total_products": total_products,
                "total_inventory_value": round(total_value, 2),
                "avg_product_price": round(total_value / total_products, 2) if total_products > 0 else 0,
                "inventory_by_shop": inventory_by_shop
            },
            message="Inventory report fetched successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/excel")
def export_to_excel(
    period: str = "all_time",
    db: Session = Depends(database.get_db)
):
    """
    Export reports data to Excel format (CSV for simplicity)
    """
    try:
        # Get the overview data
        overview_data = get_reports_overview(period, db)
        data = overview_data.data
        
        # Create CSV content
        csv_content = "Report Type,Metric,Value\n"
        
        # Overall Statistics
        csv_content += f"Overall,Total Revenue,{data['overall_stats']['total_revenue']}\n"
        csv_content += f"Overall,Total Orders,{data['overall_stats']['total_orders']}\n"
        csv_content += f"Overall,Total Shops,{data['overall_stats']['total_shops']}\n"
        csv_content += f"Overall,Active Shops,{data['overall_stats']['active_shops']}\n"
        csv_content += f"Overall,Total Customers,{data['overall_stats']['total_customers']}\n"
        csv_content += f"Overall,Total Owners,{data['overall_stats']['total_owners']}\n\n"
        
        # Shop Breakdown
        csv_content += "Shop ID,Shop Name,Owner,Status,Orders,Revenue,Products,Customers\n"
        for shop in data['shop_breakdown']:
            csv_content += f"{shop['shop_id']},{shop['shop_name']},{shop['owner_name']},{shop['status']},{shop['total_orders']},{shop['total_revenue']},{shop['total_products']},{shop['total_customers']}\n"
        
        csv_content += "\n"
        
        # Owner Breakdown
        csv_content += "Owner ID,Owner Name,Total Shops,Active,Inactive,Success Rate,Status\n"
        for owner in data['owner_breakdown']:
            csv_content += f"{owner['owner_id']},{owner['owner_name']},{owner['total_shops']},{owner['active_shops']},{owner['inactive_shops']},{owner['success_rate']},{owner['status']}\n"
        
        # Create BytesIO object
        output = BytesIO()
        output.write(csv_content.encode('utf-8'))
        output.seek(0)
        
        # Return as downloadable file
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=business_report_{period}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/summary")
def export_summary(
    period: str = "all_time",
    db: Session = Depends(database.get_db)
):
    """
    Export executive summary as JSON
    """
    try:
        # Get the overview data
        overview_data = get_reports_overview(period, db)
        data = overview_data.data
        
        # Create executive summary
        summary = {
            "report_title": "Business Executive Summary",
            "generated_at": datetime.now().isoformat(),
            "period": period,
            "key_metrics": {
                "total_revenue": data['overall_stats']['total_revenue'],
                "total_orders": data['overall_stats']['total_orders'],
                "total_shops": data['overall_stats']['total_shops'],
                "active_shops": data['overall_stats']['active_shops'],
                "total_customers": data['overall_stats']['total_customers'],
                "avg_per_sale": data['overall_stats']['avg_per_sale']
            },
            "performance_highlights": {
                "top_performing_shop": data['shop_breakdown'][0] if data['shop_breakdown'] else None,
                "total_owners": data['overall_stats']['total_owners'],
                "shop_activation_rate": round((data['overall_stats']['active_shops'] / data['overall_stats']['total_shops'] * 100) if data['overall_stats']['total_shops'] > 0 else 0, 2)
            },
            "growth_trends": data['growth_trends']
        }
        
        # Convert to JSON
        json_content = json.dumps(summary, indent=2)
        
        # Create BytesIO object
        output = BytesIO()
        output.write(json_content.encode('utf-8'))
        output.seek(0)
        
        # Return as downloadable file
        return StreamingResponse(
            output,
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=executive_summary_{period}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/pdf")
def export_to_pdf(
    period: str = "all_time",
    db: Session = Depends(database.get_db)
):
    """
    Export reports data to PDF format (returns HTML that can be converted to PDF by frontend)
    """
    try:
        # Get the overview data
        overview_data = get_reports_overview(period, db)
        data = overview_data.data
        
        # Create HTML content for PDF
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Business Analytics Report - {period}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                h1 {{ color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }}
                h2 {{ color: #374151; margin-top: 30px; }}
                table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                th, td {{ border: 1px solid #e5e7eb; padding: 12px; text-align: left; }}
                th {{ background-color: #f3f4f6; font-weight: bold; }}
                .metric {{ background: #f9fafb; padding: 20px; margin: 10px 0; border-radius: 8px; }}
                .metric-label {{ color: #6b7280; font-size: 14px; }}
                .metric-value {{ color: #1f2937; font-size: 24px; font-weight: bold; }}
                .footer {{ margin-top: 50px; text-align: center; color: #9ca3af; font-size: 12px; }}
            </style>
        </head>
        <body>
            <h1>Business Analytics & Reports</h1>
            <p><strong>Generated:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p><strong>Period:</strong> {period.replace('_', ' ').title()}</p>
            
            <h2>Overall Statistics</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                <div class="metric">
                    <div class="metric-label">Total Revenue</div>
                    <div class="metric-value">₹{data['overall_stats']['total_revenue']:.2f}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Total Orders</div>
                    <div class="metric-value">{data['overall_stats']['total_orders']}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Total Shops</div>
                    <div class="metric-value">{data['overall_stats']['total_shops']}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Active Shops</div>
                    <div class="metric-value">{data['overall_stats']['active_shops']}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Total Customers</div>
                    <div class="metric-value">{data['overall_stats']['total_customers']}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Total Owners</div>
                    <div class="metric-value">{data['overall_stats']['total_owners']}</div>
                </div>
            </div>
            
            <h2>Shop Performance Breakdown</h2>
            <table>
                <thead>
                    <tr>
                        <th>Shop Name</th>
                        <th>Owner</th>
                        <th>Status</th>
                        <th>Orders</th>
                        <th>Revenue</th>
                        <th>Products</th>
                        <th>Customers</th>
                    </tr>
                </thead>
                <tbody>
        """
        
        for shop in data['shop_breakdown'][:10]:  # Top 10 shops
            html_content += f"""
                    <tr>
                        <td>{shop['shop_name']}</td>
                        <td>{shop['owner_name']}</td>
                        <td>{shop['status']}</td>
                        <td>{shop['total_orders']}</td>
                        <td>₹{shop['total_revenue']:.2f}</td>
                        <td>{shop['total_products']}</td>
                        <td>{shop['total_customers']}</td>
                    </tr>
            """
        
        html_content += """
                </tbody>
            </table>
            
            <h2>Owner Performance</h2>
            <table>
                <thead>
                    <tr>
                        <th>Owner Name</th>
                        <th>Total Shops</th>
                        <th>Active</th>
                        <th>Inactive</th>
                        <th>Success Rate</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        """
        
        for owner in data['owner_breakdown']:
            html_content += f"""
                    <tr>
                        <td>{owner['owner_name']}</td>
                        <td>{owner['total_shops']}</td>
                        <td>{owner['active_shops']}</td>
                        <td>{owner['inactive_shops']}</td>
                        <td>{owner['success_rate']}%</td>
                        <td>{owner['status']}</td>
                    </tr>
            """
        
        html_content += """
                </tbody>
            </table>
            
            <div class="footer">
                <p>Business Analytics Report - Confidential</p>
            </div>
        </body>
        </html>
        """
        
        # Create BytesIO object
        output = BytesIO()
        output.write(html_content.encode('utf-8'))
        output.seek(0)
        
        # Return as downloadable HTML file
        return StreamingResponse(
            output,
            media_type="text/html",
            headers={
                "Content-Disposition": f"attachment; filename=business_report_{period}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
