--星輝士 セイクリッド・ダイヤ
function c80100251.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunctionF(c,aux.FilterBoolFunction(Card.IsAttribute,ATTRIBUTE_LIGHT),5),3,c80100251.ovfilter,aux.Stringid(80100251,1),5)
	c:EnableReviveLimit()
	--
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CANNOT_TO_GRAVE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTargetRange(LOCATION_DECK,LOCATION_DECK)
	e1:SetCondition(c80100251.con)
	c:RegisterEffect(e1)
	--
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetCode(EFFECT_CANNOT_DISCARD_DECK)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTargetRange(1,1)
	e2:SetCondition(c80100251.con)
	c:RegisterEffect(e2)
	--remove
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD)
	e3:SetProperty(EFFECT_FLAG_SET_AVAILABLE)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCode(EFFECT_TO_HAND_REDIRECT)
	e3:SetTargetRange(LOCATION_GRAVE,LOCATION_GRAVE)
	e3:SetCondition(c80100251.con)
	e3:SetValue(LOCATION_REMOVED)
	c:RegisterEffect(e3)
	--negate activate
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(80100251,0))
	e4:SetCategory(CATEGORY_NEGATE+CATEGORY_DESTROY)
	e4:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DAMAGE_CAL)
	e4:SetType(EFFECT_TYPE_QUICK_O)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCode(EVENT_CHAINING)
	e4:SetCondition(c80100251.condition)
	e4:SetCost(c80100251.cost)
	e4:SetTarget(c80100251.target)
	e4:SetOperation(c80100251.operation)
	c:RegisterEffect(e4)
end
function c80100251.ovfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x9c) and c:GetCode()~=80100251 and c:IsType(TYPE_XYZ)
end
function c80100251.con(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetOverlayCount()>0
end
function c80100251.condition(e,tp,eg,ep,ev,re,r,rp,chk)
	return re~=e and not e:GetHandler():IsStatus(STATUS_BATTLE_DESTROYED)
		and re:IsActiveType(TYPE_MONSTER) and Duel.IsChainNegatable(ev)
		and re:GetHandler():IsAttribute(ATTRIBUTE_DARK)
end
function c80100251.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c80100251.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_NEGATE,eg,1,0,0)
	if re:GetHandler():IsDestructable() and re:GetHandler():IsRelateToEffect(re) then
		Duel.SetOperationInfo(0,CATEGORY_DESTROY,eg,1,0,0)
	end
end
function c80100251.operation(e,tp,eg,ep,ev,re,r,rp)
	Duel.NegateActivation(ev)
	if re:GetHandler():IsRelateToEffect(re) then
		Duel.Destroy(eg,REASON_EFFECT)
	end
end