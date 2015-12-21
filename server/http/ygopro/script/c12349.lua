--Volcanic Cyclone
function c12349.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,TIMING_END_PHASE)
	e1:SetCost(c12349.cost)
	e1:SetTarget(c12349.target)
	e1:SetOperation(c12349.operation)
	c:RegisterEffect(e1)
end

function c12349.costfilter(c)
	return c:IsDiscardable() and c:IsAbleToGraveAsCost() and c:IsType(TYPE_MONSTER) and c:IsRace(RACE_PYRO)
end
function c12349.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c12349.costfilter,tp,LOCATION_HAND,0,1,e:GetHandler()) end
	local rt=Duel.GetTargetCount(Card.IsDestructable,tp,0,LOCATION_SZONE,nil)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DISCARD)
	local cg=Duel.SelectMatchingCard(tp,c12349.costfilter,tp,LOCATION_HAND,0,1,rt,nil)
	Duel.SendtoGrave(cg,REASON_COST+REASON_DISCARD)
	e:SetLabel(cg:GetCount())
end
function c12349.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsOnField() and chkc:IsDestructable() end
	if chk==0 then return Duel.IsPlayerCanDraw(tp) and Duel.IsExistingTarget(Card.IsDestructable,tp,0,LOCATION_SZONE,1,nil) end
	local ct=e:GetLabel()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RTOHAND)
	local eg=Duel.SelectTarget(tp,Card.IsDestructable,tp,0,LOCATION_SZONE,ct,ct,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,eg,ct,0,0)
end
function c12349.operation(e,tp,eg,ep,ev,re,r,rp,chk)
	local tg=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local rg=tg:Filter(Card.IsRelateToEffect,nil,e)
	if rg:GetCount()>0 then 
		Duel.Destroy(rg,nil,REASON_EFFECT)
		Duel.BreakEffect()
		Duel.Draw(tp,rg:GetCount(),REASON_EFFECT)
	end
end






