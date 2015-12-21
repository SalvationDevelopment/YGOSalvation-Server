--Pendulum Area
function c13790677.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c13790677.sccon)
	e1:SetTarget(c13790677.target)
	e1:SetOperation(c13790677.operation)
	c:RegisterEffect(e1)
end
function c13790677.cfilter(c)
	return c:IsFacedown() or not c:IsType(TYPE_PENDULUM)
end
function c13790677.sccon(e,tp,eg,ep,ev,re,r,rp)
	return not Duel.IsExistingMatchingCard(c13790677.cfilter,tp,LOCATION_MZONE,0,1,nil)
end
function c13790677.filter(c)
	return (c:GetSequence()==6 or c:GetSequence()==7) and c:IsDestructable()
end
function c13790677.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_SZONE) and chkc:IsControler(tp) and c13790677.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13790677.filter,tp,LOCATION_SZONE,0,2,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,c13790677.filter,tp,LOCATION_SZONE,0,2,2,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,2,0,0)
end
function c13790677.operation(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS):Filter(Card.IsRelateToEffect,nil,e)
	if Duel.Destroy(g,REASON_EFFECT)==2 then
		Duel.BreakEffect()
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD)
		e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
		e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
		e1:SetReset(RESET_PHASE+PHASE_END)
		e1:SetTargetRange(1,1)
		e1:SetTarget(c13790677.splimit)
		Duel.RegisterEffect(e1,tp)
	end
end
function c13790677.splimit(e,c,sump,sumtype,sumpos,targetp,se)
	return bit.band(sumtype,SUMMON_TYPE_PENDULUM)~=SUMMON_TYPE_PENDULUM
end

