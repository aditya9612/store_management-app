from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Dict, Any
from datetime import datetime, timedelta
from io import BytesIO
import json
from app import models, database
from app.response_structure import OnSuccess

router = APIRouter(prefix="/owner/reports", tags=["Owner Reports"])


def _generate_owner_report_data(
    owner_id: int,
    period: str,
    db: Session
) -> Dict[str, Any]:
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

    # Get owner
    owner = db.query(models.Owner).filter(models.Owner.id == owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")

    # Get all shops for this owner
    owner_shops = db.query(models.Store).filter(models.Store.owner_id == owner_id).all()

    # Calculate overall statistics
    total_shops = len(owner_shops)
    active_shops = len([s for s in owner_shops if s.status == 'active'])
    inactive_shops = len([s for s in owner_shops if s.status == 'inactive'])

    # Get all orders for owner's shops
    shop_ids = [shop.id for shop in owner_shops]
    orders_query = db.query(models.Order).filter(models.Order.store_id.in_(shop_ids))
    if date_filter:
        orders_query = orders_query.filter(models.Order.created_at >= date_filter)
    all_orders = orders_query.all()

    # Calculate revenue metrics
    total_revenue = sum(order.total - order.discount for order in all_orders)
    total_orders = len(all_orders)

    # Calculate monthly revenue
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_orders = db.query(models.Order).filter(
        models.Order.store_id.in_(shop_ids),
        models.Order.created_at >= current_month_start
    ).all()
    monthly_revenue = sum(order.total - order.discount for order in monthly_orders)

    # Calculate previous month revenue
    if current_month_start.month == 1:
        prev_month_start = current_month_start.replace(year=current_month_start.year - 1, month=12)
    else:
        prev_month_start = current_month_start.replace(month=current_month_start.month - 1)

    prev_monthly_orders = db.query(models.Order).filter(
        models.Order.store_id.in_(shop_ids),
        models.Order.created_at >= prev_month_start,
        models.Order.created_at < current_month_start
    ).all()
    prev_monthly_revenue = sum(order.total - order.discount for order in prev_monthly_orders)

    # Calculate growth
    growth_percent = 0
    if prev_monthly_revenue > 0:
        growth_percent = ((monthly_revenue - prev_monthly_revenue) / prev_monthly_revenue) * 100
    elif monthly_revenue > 0:
        growth_percent = 100

    # Get all products across owner's shops
    all_products = db.query(models.Product).filter(models.Product.store_id.in_(shop_ids)).all()
    total_products = len(all_products)

    # Get all customers across owner's shops
    all_customers = db.query(models.Customer).filter(models.Customer.store_id.in_(shop_ids)).all()
    total_customers = len(all_customers)

    # Calculate total sales (products sold)
    total_sales = db.query(func.sum(models.OrderItem.quantity)).join(
        models.Order
    ).filter(
        models.Order.store_id.in_(shop_ids)
    ).scalar() or 0

    # Shop-wise breakdown
    shop_breakdown = []
    for shop in owner_shops:
        shop_orders_query = db.query(models.Order).filter(models.Order.store_id == shop.id)
        if date_filter:
            shop_orders_query = shop_orders_query.filter(models.Order.created_at >= date_filter)
        shop_orders = shop_orders_query.all()

        shop_revenue = sum(order.total - order.discount for order in shop_orders)

        # Monthly revenue for this shop
        shop_monthly_orders = db.query(models.Order).filter(
            models.Order.store_id == shop.id,
            models.Order.created_at >= current_month_start
        ).all()
        shop_monthly_revenue = sum(order.total - order.discount for order in shop_monthly_orders)

        # Previous month revenue for this shop
        shop_prev_monthly_orders = db.query(models.Order).filter(
            models.Order.store_id == shop.id,
            models.Order.created_at >= prev_month_start,
            models.Order.created_at < current_month_start
        ).all()
        shop_prev_monthly_revenue = sum(order.total - order.discount for order in shop_prev_monthly_orders)

        # Calculate trend for this shop
        shop_trend = 0
        if shop_prev_monthly_revenue > 0:
            shop_trend = ((shop_monthly_revenue - shop_prev_monthly_revenue) / shop_prev_monthly_revenue) * 100
        elif shop_monthly_revenue > 0:
            shop_trend = 100

        shop_products = db.query(models.Product).filter(models.Product.store_id == shop.id).all()
        shop_customers = db.query(models.Customer).filter(models.Customer.store_id == shop.id).all()

        shop_breakdown.append({
            "shop_id": shop.id,
            "shop_name": shop.name,
            "status": shop.status,
            "location": shop.address or f"{shop.city}, {shop.state}",
            "total_revenue": round(shop_revenue, 2),
            "monthly_revenue": round(shop_monthly_revenue, 2),
            "previous_monthly_revenue": round(shop_prev_monthly_revenue, 2),
            "trend": round(shop_trend, 2),
            "total_orders": len(shop_orders),
            "total_products": len(shop_products),
            "total_customers": len(shop_customers)
        })

    # Recent orders
    recent_orders_query = db.query(models.Order).filter(
        models.Order.store_id.in_(shop_ids)
    ).order_by(desc(models.Order.created_at)).limit(10)

    recent_orders = []
    for order in recent_orders_query.all():
        # Get first item from order
        first_item = db.query(models.OrderItem).filter(
            models.OrderItem.order_id == order.id
        ).first()

        product_name = "N/A"
        if first_item:
            if first_item.product:
                product_name = first_item.product.name
            elif first_item.name:
                product_name = first_item.name

        recent_orders.append({
            "id": order.id,
            "customer_name": order.customer.name if order.customer else "Unknown",
            "shop_name": order.store.name if order.store else "Unknown",
            "amount": round(order.total - order.discount, 2),
            "product_name": product_name,
            "status": order.status,
            "date": order.created_at.isoformat() if order.created_at else None
        })

    # Top products
    top_products_query = db.query(
        models.Product.id,
        models.Product.name,
        models.Product.price,
        func.sum(models.OrderItem.quantity).label('total_sold')
    ).join(
        models.OrderItem, models.OrderItem.product_id == models.Product.id
    ).join(
        models.Order, models.OrderItem.order_id == models.Order.id
    ).filter(
        models.Order.store_id.in_(shop_ids)
    ).group_by(
        models.Product.id, models.Product.name, models.Product.price
    ).order_by(
        desc('total_sold')
    ).limit(5)

    top_products = []
    for product in top_products_query.all():
        top_products.append({
            "product_id": product.id,
            "product_name": product.name,
            "price": round(product.price, 2),
            "total_sold": product.total_sold
        })

    return {
        "period": period,
        "owner_info": {
            "owner_id": owner.id,
            "owner_name": owner.name,
            "owner_email": owner.email,
            "owner_mobile": owner.mobile
        },
        "summary_stats": {
            "total_revenue": round(total_revenue, 2),
            "monthly_revenue": round(monthly_revenue, 2),
            "previous_monthly_revenue": round(prev_monthly_revenue, 2),
            "growth_percent": round(growth_percent, 2),
            "total_orders": total_orders,
            "total_shops": total_shops,
            "active_shops": active_shops,
            "inactive_shops": inactive_shops,
            "total_products": total_products,
            "total_customers": total_customers,
            "total_sales": total_sales
        },
        "shop_breakdown": shop_breakdown,
        "recent_orders": recent_orders,
        "top_products": top_products
    }


@router.get("/overview/{owner_id}", response_model=OnSuccess[Dict[str, Any]])
def get_owner_reports_overview(
    owner_id: int,
    period: str = "all_time",  # all_time, last_7_days, last_30_days, last_quarter, last_year
    db: Session = Depends(database.get_db)
):
    """
    Get comprehensive reports overview for a specific owner's shops
    """
    try:
        data = _generate_owner_report_data(owner_id, period, db)
        return OnSuccess(data=data, message="Owner reports fetched successfully")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/revenue/{owner_id}", response_model=OnSuccess[Dict[str, Any]])
def get_owner_revenue_report(
    owner_id: int,
    period: str = "all_time",
    db: Session = Depends(database.get_db)
):
    """Get revenue focused report for a specific owner's shops"""
    try:
        data = _generate_owner_report_data(owner_id, period, db)
        revenue_data = {
            "period": data["period"],
            "summary_stats": data["summary_stats"],
            "shop_breakdown": data["shop_breakdown"],
            "owner_info": data["owner_info"],
        }
        return OnSuccess(data=revenue_data, message="Owner revenue report fetched successfully")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/excel/{owner_id}")
def export_owner_excel(
    owner_id: int,
    period: str = "all_time",
    db: Session = Depends(database.get_db)
):
    """
    Export owner reports to Excel (CSV)
    """
    try:
        data = _generate_owner_report_data(owner_id, period, db)

        # Create CSV content
        csv_content = f"Owner Report - {data['owner_info']['owner_name']}\n"
        csv_content += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        csv_content += f"Period: {data['period'].replace('_', ' ').title()}\n\n"

        # Owner Info
        csv_content += "Owner ID,Owner Name,Owner Email\n"
        csv_content += f"{data['owner_info']['owner_id']},{data['owner_info']['owner_name']},{data['owner_info']['owner_email']}\n\n"

        # Summary Stats
        csv_content += "Metric,Value\n"
        csv_content += f"Total Revenue,{data['summary_stats']['total_revenue']}\n"
        csv_content += f"Monthly Revenue,{data['summary_stats']['monthly_revenue']}\n"
        csv_content += f"Growth,{data['summary_stats']['growth_percent']}%\n"
        csv_content += f"Total Orders,{data['summary_stats']['total_orders']}\n"
        csv_content += f"Total Shops,{data['summary_stats']['total_shops']}\n"
        csv_content += f"Active Shops,{data['summary_stats']['active_shops']}\n"
        csv_content += f"Inactive Shops,{data['summary_stats']['inactive_shops']}\n"
        csv_content += f"Total Products,{data['summary_stats']['total_products']}\n"
        csv_content += f"Total Customers,{data['summary_stats']['total_customers']}\n"
        csv_content += f"Total Sales,{data['summary_stats']['total_sales']}\n\n"
        
        # Shop Breakdown
        csv_content += "Shop Name,Status,Revenue,Monthly Revenue,Trend,Orders,Products,Customers\n"
        for shop in data['shop_breakdown']:
            csv_content += f"{shop['shop_name']},{shop['status']},{shop['total_revenue']},{shop['monthly_revenue']},{shop['trend']}%,{shop['total_orders']},{shop['total_products']},{shop['total_customers']}\n"
        
        # Create BytesIO object
        output = BytesIO()
        output.write(csv_content.encode('utf-8'))
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=owner_report_{owner_id}_{period}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/pdf/{owner_id}")
def export_owner_pdf(
    owner_id: int,
    period: str = "all_time",
    db: Session = Depends(database.get_db)
):
    """
    Export owner reports to PDF (HTML)
    """
    try:
        data = _generate_owner_report_data(owner_id, period, db)

        # Create HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Owner Report - {data['owner_info']['owner_name']}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                h1 {{ color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }}
                h2 {{ color: #374151; margin-top: 30px; }}
                table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                th, td {{ border: 1px solid #e5e7eb; padding: 12px; text-align: left; }}
                th {{ background-color: #f3f4f6; font-weight: bold; }}
                .metric {{ background: #f9fafb; padding: 20px; margin: 10px 0; border-radius: 8px; display: inline-block; width: 45%; }}
                .metric-label {{ color: #6b7280; font-size: 14px; }}
                .metric-value {{ color: #1f2937; font-size: 24px; font-weight: bold; }}
            </style>
        </head>
        <body>
            <h1>Owner Report - {data['owner_info']['owner_name']}</h1>
            <p><strong>Owner ID:</strong> {data['owner_info']['owner_id']}</p>
            <p><strong>Email:</strong> {data['owner_info']['owner_email']}</p>
            <p><strong>Generated:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p><strong>Period:</strong> {period.replace('_', ' ').title()}</p>
            
            <h2>Summary Statistics</h2>
            <div class="metric">
                <div class="metric-label">Total Revenue</div>
                <div class="metric-value">₹{data['summary_stats']['total_revenue']:.2f}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Monthly Revenue</div>
                <div class="metric-value">₹{data['summary_stats']['monthly_revenue']:.2f}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Growth</div>
                <div class="metric-value">{data['summary_stats']['growth_percent']:.2f}%</div>
            </div>
            <div class="metric">
                <div class="metric-label">Total Orders</div>
                <div class="metric-value">{data['summary_stats']['total_orders']}</div>
            </div>
            
            <h2>Shop Performance</h2>
            <table>
                <thead>
                    <tr>
                        <th>Shop Name</th>
                        <th>Status</th>
                        <th>Revenue</th>
                        <th>Monthly</th>
                        <th>Trend</th>
                        <th>Orders</th>
                    </tr>
                </thead>
                <tbody>
        """
        
        for shop in data['shop_breakdown']:
            html_content += f"""
                    <tr>
                        <td>{shop['shop_name']}</td>
                        <td>{shop['status']}</td>
                        <td>₹{shop['total_revenue']:.2f}</td>
                        <td>₹{shop['monthly_revenue']:.2f}</td>
                        <td>{shop['trend']:.2f}%</td>
                        <td>{shop['total_orders']}</td>
                    </tr>
            """
        
        html_content += """
                </tbody>
            </table>
        </body>
        </html>
        """
        
        # Create BytesIO object
        output = BytesIO()
        output.write(html_content.encode('utf-8'))
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="text/html",
            headers={
                "Content-Disposition": f"attachment; filename=owner_report_{owner_id}_{period}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sales/{owner_id}", response_model=OnSuccess[Dict[str, Any]])
def get_owner_sales_report(
    owner_id: int,
    period: str = "all_time",
    db: Session = Depends(database.get_db)
):
    """Get sales focused report for a specific owner's shops"""
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

        # Get owner
        owner = db.query(models.Owner).filter(models.Owner.id == owner_id).first()
        if not owner:
            raise HTTPException(status_code=404, detail="Owner not found")

        # Get all shops for this owner
        owner_shops = db.query(models.Store).filter(models.Store.owner_id == owner_id).all()
        shop_ids = [shop.id for shop in owner_shops]
        
        if not shop_ids:
            return OnSuccess(data={
                "period": period,
                "summary_stats": {
                    "total_sales": 0,
                    "total_revenue": 0,
                    "average_sale_value": 0,
                    "products_count": 0,
                    "categories_count": 0,
                    "active_shops": 0
                },
                "top_products": [],
                "recent_orders": [],
                "category_breakdown": {},
                "shop_breakdown": []
            }, message="No shops found for this owner")

        # Get all orders for owner's shops
        orders_query = db.query(models.Order).filter(models.Order.store_id.in_(shop_ids))
        if date_filter:
            orders_query = orders_query.filter(models.Order.created_at >= date_filter)
        all_orders = orders_query.all()

        # Calculate total sales (quantity of items sold)
        total_sales = db.query(func.sum(models.OrderItem.quantity)).join(
            models.Order
        ).filter(
            models.Order.store_id.in_(shop_ids)
        )
        if date_filter:
            total_sales = total_sales.filter(models.Order.created_at >= date_filter)
        total_sales = int(total_sales.scalar() or 0)

        # Calculate total revenue from sales
        total_revenue = float(sum(order.total - order.discount for order in all_orders))
        
        # Calculate average sale value
        average_sale_value = float(total_revenue / total_sales) if total_sales > 0 else 0.0

        # Get all products
        all_products = db.query(models.Product).filter(models.Product.store_id.in_(shop_ids)).all()
        products_count = len(all_products)
        
        # Get unique categories (assuming products have category field, if not we'll use a default)
        categories = set()
        for product in all_products:
            # If product model has category field
            if hasattr(product, 'category') and product.category:
                categories.add(product.category)
            else:
                categories.add("General")  # Default category
        categories_count = len(categories)

        # Active shops count
        active_shops = len([s for s in owner_shops if s.status == 'active'])

        # Top selling products
        top_products_query = db.query(
            models.Product.id,
            models.Product.name,
            models.Product.price,
            models.Store.name.label('shop_name'),
            func.sum(models.OrderItem.quantity).label('sales_count'),
            func.sum(models.OrderItem.quantity * models.OrderItem.price).label('revenue')
        ).join(
            models.OrderItem, models.OrderItem.product_id == models.Product.id
        ).join(
            models.Order, models.OrderItem.order_id == models.Order.id
        ).join(
            models.Store, models.Product.store_id == models.Store.id
        ).filter(
            models.Order.store_id.in_(shop_ids)
        )
        if date_filter:
            top_products_query = top_products_query.filter(models.Order.created_at >= date_filter)
        
        top_products_query = top_products_query.group_by(
            models.Product.id, models.Product.name, models.Product.price, models.Store.name
        ).order_by(
            desc('sales_count')
        ).limit(5)

        top_products = []
        for product in top_products_query.all():
            # Get category if available
            product_obj = db.query(models.Product).filter(models.Product.id == product.id).first()
            category = "General"
            if product_obj and hasattr(product_obj, 'category') and product_obj.category:
                category = product_obj.category
            
            top_products.append({
                "id": product.id,
                "name": product.name,
                "category": category,
                "shop_name": product.shop_name,
                "sales_count": int(product.sales_count),
                "revenue": round(float(product.revenue), 2),
                "trend": 0  # Can be calculated if needed
            })

        # Recent orders
        recent_orders_query = db.query(models.Order).filter(
            models.Order.store_id.in_(shop_ids)
        ).order_by(desc(models.Order.created_at)).limit(10)

        recent_orders = []
        for order in recent_orders_query.all():
            # Get first item from order
            first_item = db.query(models.OrderItem).filter(
                models.OrderItem.order_id == order.id
            ).first()

            product_name = "N/A"
            if first_item:
                if first_item.product:
                    product_name = first_item.product.name
                elif first_item.name:
                    product_name = first_item.name

            recent_orders.append({
                "id": order.id,
                "customer_name": order.customer.name if order.customer else "Unknown",
                "shop_name": order.store.name if order.store else "Unknown",
                "amount": round(order.total - order.discount, 2),
                "product_name": product_name,
                "status": order.status,
                "date": order.created_at.isoformat() if order.created_at else None
            })

        # Category breakdown
        category_breakdown = {}
        for product in all_products:
            category = "General"
            if hasattr(product, 'category') and product.category:
                category = product.category
            
            # Get sales for this product
            product_sales = db.query(
                func.sum(models.OrderItem.quantity).label('quantity'),
                func.sum(models.OrderItem.quantity * models.OrderItem.price).label('revenue')
            ).join(
                models.Order
            ).filter(
                models.OrderItem.product_id == product.id,
                models.Order.store_id.in_(shop_ids)
            )
            if date_filter:
                product_sales = product_sales.filter(models.Order.created_at >= date_filter)
            
            result = product_sales.first()
            
            if category not in category_breakdown:
                category_breakdown[category] = {
                    "total_sales": 0,
                    "total_revenue": 0,
                    "products": 0
                }
            
            category_breakdown[category]["products"] += 1
            if result and result.quantity:
                category_breakdown[category]["total_sales"] += int(result.quantity)
                category_breakdown[category]["total_revenue"] += round(float(result.revenue or 0), 2)

        # Shop breakdown for sales
        shop_breakdown = []
        for shop in owner_shops:
            shop_orders_query = db.query(models.Order).filter(models.Order.store_id == shop.id)
            if date_filter:
                shop_orders_query = shop_orders_query.filter(models.Order.created_at >= date_filter)
            shop_orders = shop_orders_query.all()
            
            # Shop sales count
            shop_sales = db.query(func.sum(models.OrderItem.quantity)).join(
                models.Order
            ).filter(
                models.Order.store_id == shop.id
            )
            if date_filter:
                shop_sales = shop_sales.filter(models.Order.created_at >= date_filter)
            shop_sales = int(shop_sales.scalar() or 0)
            
            shop_revenue = float(sum(order.total - order.discount for order in shop_orders))
            
            shop_breakdown.append({
                "shop_id": shop.id,
                "shop_name": shop.name,
                "status": shop.status,
                "sales_count": int(shop_sales),
                "revenue": round(shop_revenue, 2),
                "orders_count": len(shop_orders)
            })

        sales_data = {
            "period": period,
            "summary_stats": {
                "total_sales": int(total_sales),
                "total_revenue": round(total_revenue, 2),
                "average_sale_value": round(average_sale_value, 2),
                "products_count": products_count,
                "categories_count": categories_count,
                "active_shops": active_shops
            },
            "top_products": top_products,
            "recent_orders": recent_orders,
            "category_breakdown": category_breakdown,
            "shop_breakdown": shop_breakdown
        }
        
        return OnSuccess(data=sales_data, message="Owner sales report fetched successfully")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
