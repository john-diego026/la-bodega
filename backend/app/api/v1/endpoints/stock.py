from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.stock import StockCreate, StockUpdate, StockResponse, ResumenStockGeneral
from app.db.supabase import get_supabase_client
from app.core.security import get_current_user

router = APIRouter(prefix="/stock", tags=["Stock e Inventario"])

@router.get("", response_model=List[StockResponse], summary="Consultar todos los registros de stock")
async def list_stock():
    """
    Lista las existencias de bebidas, gaseosas y cervezas,
    incluyendo el estado automático de 'alerta_producto_faltante'.
    """
    try:
        client = get_supabase_client()
        response = client.table("stock").select("*").order("updated_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener stock: {str(e)}"
        )

@router.get("/alertas", response_model=List[StockResponse], summary="Obtener únicamente productos con alerta de faltante")
async def list_stock_alertas():
    """
    Endpoint especializado para el panel de alertas de la discoteca.
    Retorna solo aquellos ítems donde la cantidad es menor o igual al umbral mínimo configurado.
    """
    try:
        client = get_supabase_client()
        # Filtro directo por el campo booleano computado en la base de datos
        response = client.table("stock").select("*").eq("alerta_producto_faltante", True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al consultar alertas de stock: {str(e)}"
        )

@router.get("/resumen-general", response_model=ResumenStockGeneral, summary="Resumen ejecutivo del inventario y alertas")
async def get_resumen_general():
    """
    Calcula en tiempo real las métricas generales de La Bodega:
    - Total de licores y bebidas
    - Total de gaseosas y mezcladores
    - Cantidad de productos con stock crítico
    - Lista de nombres de productos en riesgo de desabastecimiento
    """
    try:
        client = get_supabase_client()
        
        bebidas_res = client.table("bebidas").select("id, nombre_b, cantidad, tipo").execute()
        gaseosas_res = client.table("gaseosas").select("id, nombre_g, cantidad").execute()
        stock_res = client.table("stock").select("*").execute()
        
        items_criticos = []
        
        # Alertas en bebidas (umbral 5)
        for b in bebidas_res.data:
            if b.get("cantidad", 0) <= 5:
                items_criticos.append({
                    "id": b["id"],
                    "tipo": "Bebida/Licor",
                    "nombre": b["nombre_b"],
                    "cantidad": b["cantidad"],
                    "umbral": 5
                })
                
        # Alertas en gaseosas (umbral 8)
        for g in gaseosas_res.data:
            if g.get("cantidad", 0) <= 8:
                items_criticos.append({
                    "id": g["id"],
                    "tipo": "Gaseosa/Mezclador",
                    "nombre": g["nombre_g"],
                    "cantidad": g["cantidad"],
                    "umbral": 8
                })
                
        # Alertas en tabla stock
        for s in stock_res.data:
            if s.get("alerta_producto_faltante", False):
                items_criticos.append({
                    "id": s["id"],
                    "tipo": "Stock General/Cerveza",
                    "nombre": s.get("cerveza") or "Item de Stock",
                    "cantidad": s["cantidad"],
                    "umbral": s.get("umbral_minimo", 10)
                })

        return ResumenStockGeneral(
            total_bebidas=len(bebidas_res.data),
            total_gaseosas=len(gaseosas_res.data),
            total_alertas=len(items_criticos),
            items_criticos=items_criticos
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al calcular resumen: {str(e)}"
        )

@router.post("", response_model=StockResponse, status_code=status.HTTP_201_CREATED, summary="Registrar entrada de stock")
async def create_stock(data: StockCreate, current_user: dict = Depends(get_current_user)):
    """
    Crea un registro de stock. La columna 'alerta_producto_faltante'
    se computa automáticamente como (cantidad <= umbral_minimo).
    """
    try:
        client = get_supabase_client()
        payload = {
            "bebida_id": data.bebida_id,
            "gaseosa_id": data.gaseosa_id,
            "cerveza": data.cerveza,
            "cantidad": data.cantidad,
            "umbral_minimo": data.umbral_minimo
        }
        response = client.table("stock").insert(payload).execute()
        if not response.data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se pudo registrar en stock")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error al registrar stock: {str(e)}")

@router.put("/{stock_id}", response_model=StockResponse, summary="Actualizar cantidad o umbral de stock")
async def update_stock(stock_id: str, data: StockUpdate, current_user: dict = Depends(get_current_user)):
    try:
        client = get_supabase_client()
        update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items()}
        if not update_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se enviaron datos para actualizar")
            
        response = client.table("stock").update(update_data).eq("id", stock_id).execute()
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro de stock no encontrado")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error al actualizar stock: {str(e)}")

@router.delete("/{stock_id}", summary="Eliminar registro de stock")
async def delete_stock(stock_id: str, current_user: dict = Depends(get_current_user)):
    try:
        client = get_supabase_client()
        response = client.table("stock").delete().eq("id", stock_id).execute()
        return {"message": "Registro de stock eliminado correctamente", "id": stock_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error al eliminar stock: {str(e)}")
