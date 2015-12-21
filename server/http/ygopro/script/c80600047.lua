--Ｎｏ．６５　裁断魔人 ジャッジ・バスター
function c80600047.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunctionF(c,aux.FilterBoolFunction(Card.IsAttribute,ATTRIBUTE_DARK),2),2)
	c:EnableReviveLimit()
	--negate
	local e4=Effect.CreateEffect(c)
	e4:SetCategory(CATEGORY_NEGATE+CATEGORY_DAMAGE)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_QUICK_O)
	e4:SetCode(EVENT_CHAINING)
	e4:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DAMAGE_CAL)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCondition(c80600047.condition)
	e4:SetCost(c80600047.cost)
	e4:SetOperation(c80600047.op)
	c:RegisterEffect(e4)
end
function c80600047.condition(e,tp,eg,ep,ev,re,r,rp,chk)
	return not e:GetHandler():IsStatus(STATUS_BATTLE_DESTROYED) and re:IsActiveType(TYPE_MONSTER)
		and Duel.IsChainNegatable(ev) and ep~=tp
end
function c80600047.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,2,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,2,2,REASON_COST)
end
function c80600047.op(e,tp,eg,ep,ev,re,r,rp)
	Duel.NegateActivation(ev)
	if re:GetHandler():IsRelateToEffect(re) then
		Duel.Damage(1-tp,500,REASON_EFFECT)
	end
end