--Closed Plant Gate
function c11111107.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,0x1e0)
	e1:SetCondition(c11111107.condition)
	e1:SetOperation(c11111107.activate)
	c:RegisterEffect(e1)
end
function c11111107.cfilter(c,tp)
	return c:IsFaceup() and Duel.IsExistingMatchingCard(c11111107.cfilter2,tp,LOCATION_MZONE,0,1,c,c:GetCode())
end
function c11111107.cfilter2(c,code)
	return c:IsFaceup() and c:GetCode()==code
end
function c11111107.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c11111107.cfilter,tp,LOCATION_MZONE,0,1,nil,tp)
end
function c11111107.activate(e,tp,eg,ep,ev,re,r,rp)
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CANNOT_ATTACK)
	e1:SetTargetRange(0,LOCATION_MZONE)
	e1:SetReset(RESET_PHASE+PHASE_END,2)
	Duel.RegisterEffect(e1,tp)
end