--Crush Card Virus (Errata)
function c577285701.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,TIMING_TOHAND)
	e1:SetCost(c577285701.cost)
	e1:SetTarget(c577285701.target)
	e1:SetOperation(c577285701.activate)
	c:RegisterEffect(e1)
end
function c577285701.costfilter(c)
	return c:IsAttribute(ATTRIBUTE_DARK) and c:IsAttackBelow(1000)
end
function c577285701.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(tp,c577285701.costfilter,1,nil) end
	local g=Duel.SelectReleaseGroup(tp,c577285701.costfilter,1,1,nil)
	Duel.Release(g,REASON_COST)
end
function c577285701.tgfilter(c)
	return c:IsFaceup() and c:GetAttack()>=1500 and c:IsDestructable()
end
function c577285701.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local g=Duel.GetMatchingGroup(c577285701.tgfilter,tp,0,LOCATION_MZONE,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c577285701.filter(c)
	return c:IsType(TYPE_MONSTER) and c:IsAttackAbove(1500)
end
function c577285701.activate(e,tp,eg,ep,ev,re,r,rp)
	local conf=Duel.GetFieldGroup(tp,0,LOCATION_MZONE+LOCATION_HAND)
	if conf:GetCount()>0 then
		Duel.ConfirmCards(tp,conf)
		local dg=conf:Filter(c577285701.filter,nil)
		Duel.Destroy(dg,REASON_EFFECT)
		Duel.ShuffleHand(1-tp)
		local g=Duel.GetMatchingGroup(c577285701.filter,1-tp,LOCATION_DECK,0,nil)
		Duel.Hint(HINT_SELECTMSG,1-tp,HINTMSG_TOGRAVE)
		local sg=g:Select(1-tp,0,3,nil)
		Duel.HintSelection(sg)
		Duel.Destroy(sg,REASON_EFFECT)
		
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD)
		e1:SetCode(EFFECT_CHANGE_DAMAGE)
		e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
		e1:SetTargetRange(0,1)
		e1:SetValue(0)
		e1:SetReset(RESET_PHASE+PHASE_END,2)
		Duel.RegisterEffect(e1,tp)
	end
end
