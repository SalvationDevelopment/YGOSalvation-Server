--Super Quantum Mecha Beast Magnalier
--Fixed by Ragna_Edge
function c13754007.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,5,2)
	c:EnableReviveLimit()
	--cannot attack
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CANNOT_ATTACK)
	e1:SetCondition(c13754007.atcon)
	c:RegisterEffect(e1)
	--destroy
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DESTROY)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetRange(LOCATION_MZONE)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCountLimit(1)
	e2:SetCost(c13754007.descost)
	e2:SetTarget(c13754007.destg)
	e2:SetOperation(c13754007.desop)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCountLimit(1)
	e3:SetTarget(c13754007.mttg)
	e3:SetOperation(c13754007.mtop)
	c:RegisterEffect(e3)

end
function c13754007.atcon(e)
	return e:GetHandler():GetOverlayCount()==0
end
function c13754007.descost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c13754007.desfilter(c)
	return c:IsDestructable()
end
function c13754007.destg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsOnField() and chkc:IsControler(1-tp) and c13754007.desfilter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13754007.desfilter,tp,0,LOCATION_MZONE,1,nil) and
	(tp==Duel.GetTurnPlayer() or e:GetHandler():GetOverlayGroup():IsExists(Card.IsCode,1,nil,13754000))	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,c13754007.desfilter,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,1,0,0)
end
function c13754007.desop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.Destroy(tc,REASON_EFFECT)
	end
end

function c13754007.mtfilter(c)
	return c:IsSetCard(0x10d5) and c:IsType(TYPE_MONSTER)
end
function c13754007.mttg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13754007.mtfilter,tp,LOCATION_MZONE+LOCATION_HAND,0,1,e:GetHandler()) end
end
function c13754007.mtop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if not c:IsRelateToEffect(e) or c:IsFacedown() then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_XMATERIAL)
	local g=Duel.SelectMatchingCard(tp,c13754007.mtfilter,tp,LOCATION_MZONE+LOCATION_HAND,0,1,1,c)
	if g:GetCount()>0 then
		Duel.Overlay(c,g)
	end
end
