--銀河の施し
function c80200057.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DRAW)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c80200057.condition)
	e1:SetCost(c80200057.cost)
	e1:SetTarget(c80200057.target)
	e1:SetOperation(c80200057.activate)
	c:RegisterEffect(e1)
end
function c80200057.cfilter(c)
	return c:IsSetCard(0x7b) and c:IsType(TYPE_XYZ) and c:IsFaceup()
end
function c80200057.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c80200057.cfilter,tp,LOCATION_MZONE,0,1,nil)
end
function c80200057.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80200057.filter,tp,LOCATION_HAND,0,1,nil) 
	and  Duel.GetFlagEffect(tp,80200057)==0 
	end
	Duel.DiscardHand(tp,Card.IsDiscardable,1,1,REASON_COST+REASON_DISCARD)
	Duel.RegisterFlagEffect(tp,80200057,RESET_PHASE+PHASE_END,EFFECT_FLAG_OATH,1)
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CHANGE_DAMAGE)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetTargetRange(0,1)
	e1:SetValue(c80200057.val)
	e1:SetReset(RESET_PHASE+PHASE_END,1)
	Duel.RegisterEffect(e1,tp)
end
function c80200057.val(e,re,dam,r,rp,rc)
	return dam/2
end
function c80200057.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDraw(tp,2) end
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(2)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,2)
end
function c80200057.activate(e,tp,eg,ep,ev,re,r,rp)
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Draw(p,d,REASON_EFFECT)
end