--Card of Demise
--Edited by: HelixReactor
function c13701811.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DRAW)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,13701811)
	e1:SetCost(c13701811.cost)
	e1:SetTarget(c13701811.target)
	e1:SetOperation(c13701811.operation)
	c:RegisterEffect(e1)
end
function c13701811.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetActivityCount(tp,ACTIVITY_SPSUMMON)==0 end
	--oath effects
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
	e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e1:SetReset(RESET_PHASE+PHASE_END)
	e1:SetTargetRange(1,0)
	Duel.RegisterEffect(e1,tp)
end
function c13701811.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDraw(tp) and Duel.GetFieldGroupCount(tp,LOCATION_HAND,0)<3 end
	local ht=Duel.GetFieldGroupCount(tp,LOCATION_HAND,0)
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(3-ht)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,3-ht)
end
function c13701811.operation(e,tp,eg,ep,ev,re,r,rp)
	local p=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER)
	local ht=Duel.GetFieldGroupCount(p,LOCATION_HAND,0)
	if ht<3 then
		Duel.Draw(p,3-ht,REASON_EFFECT)
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		e1:SetCode(EVENT_PHASE+PHASE_END)
		e1:SetCountLimit(1)
		e1:SetReset(RESET_PHASE+PHASE_END)
		e1:SetOperation(c13701811.disop)
		Duel.RegisterEffect(e1,p)
	end
	local e2=Effect.CreateEffect(e:GetHandler())
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_CHANGE_DAMAGE)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetTargetRange(0,1)
	e2:SetValue(0)
	e2:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e2,tp)
	local e3=e2:Clone()
	e3:SetCode(EFFECT_NO_EFFECT_DAMAGE)
	e3:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e3,tp)
end
function c13701811.disop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetFieldGroup(e:GetOwnerPlayer(),LOCATION_HAND,0)
	Duel.SendtoGrave(g,REASON_EFFECT+REASON_DISCARD)
end
