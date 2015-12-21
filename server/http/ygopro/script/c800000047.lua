--フォトン・アレキサンドラ・クイーン
function c800000047.initial_effect(c)
  --xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunctionF(c,aux.FilterBoolFunction(Card.IsSetCard,0x6a),4),2)
	c:EnableReviveLimit()
	--toHand
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TODECK)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetCountLimit(1)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCost(c800000047.cost)
	e1:SetTarget(c800000047.target)
	e1:SetOperation(c800000047.operation)
	c:RegisterEffect(e1)
end
function c800000047.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end

function c800000047.filter(c,p)
	return c:IsAbleToHand() and 
	c:GetOwner()==p
end

function c800000047.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local g=Duel.GetMatchingGroup(c800000047.filter,tp,LOCATION_MZONE,LOCATION_MZONE,nil,tp)
	local g1=Duel.GetMatchingGroup(c800000047.filter,tp,LOCATION_MZONE,LOCATION_MZONE,nil,1-tp)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,g:GetCount()+g1:GetCount(),0,0)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,tp,g:GetCount()*300)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,g1:GetCount()*300)
end

function c800000047.filter1(c,p)
	return (c:IsLocation(LOCATION_HAND)or c:IsLocation(LOCATION_EXTRA)) and 
	c:IsControler(p) and c:IsAbleToHand()
end

function c800000047.operation(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(Card.IsAbleToHand,tp,LOCATION_MZONE,LOCATION_MZONE,nil)
	if g:GetCount()==0 then return end
	Duel.SendtoHand(g,nil,REASON_EFFECT)
	local og=Duel.GetOperatedGroup()
	local ct=og:FilterCount(c800000047.filter1,nil,tp)
	local ct1=og:FilterCount(c800000047.filter1,nil,1-tp)
	Duel.Damage(tp,ct*300,REASON_EFFECT)
	Duel.Damage(1-tp,ct1*300,REASON_EFFECT)
end
