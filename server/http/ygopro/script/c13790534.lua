--Odd-Eyes Rebellion Dragon
function c13790534.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.FilterBoolFunction(Card.IsRace,RACE_DRAGON),7,2)
	c:EnableReviveLimit()
	--pendulum summon
	aux.AddPendulumProcedure(c)
	--Place a Pendulum Card
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_PZONE)
	e1:SetCountLimit(1)
	e1:SetCondition(c13790534.condition1)
	e1:SetTarget(c13790534.target1)
	e1:SetOperation(c13790534.operation1)
	c:RegisterEffect(e1)
	--destroy
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DESTROY)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_DELAY)
	e2:SetCode(EVENT_TO_DECK)
	e2:SetCondition(c13790534.descon)
	e2:SetTarget(c13790534.destg)
	e2:SetOperation(c13790534.desop)
	c:RegisterEffect(e2)
	--Destroy and Damage
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_DESTROY)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetCode(EVENT_SPSUMMON_SUCCESS)
	e3:SetCondition(c13790534.ddescon)
	e3:SetOperation(c13790534.ddesop)
	c:RegisterEffect(e3)
end
--Place a Pendulum Card
function c13790534.condition1(e,tp,eg,ep,ev,re,r,rp)
	local seq=e:GetHandler():GetSequence()
	local tc=Duel.GetFieldCard(e:GetHandlerPlayer(),LOCATION_SZONE,13-seq)
	return tc==nil
end
function c13790534.pfilter(c)
	return c:IsType(TYPE_PENDULUM)
end
function c13790534.target1(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13790534.pfilter,tp,LOCATION_DECK,0,1,nil) end
end
function c13790534.operation1(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOFIELD)
	local g=Duel.SelectMatchingCard(tp,c13790534.pfilter,tp,LOCATION_DECK,0,1,1,nil)
	local tc=g:GetFirst()
	if tc then
		Duel.MoveToField(tc,tp,tp,LOCATION_SZONE,7,POS_FACEUP,true)
		Duel.ChangePosition(tc,POS_FACEUP)
	end
end
--ToPendulum
function c13790534.descon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsPreviousPosition(POS_FACEUP) and e:GetHandler():IsPreviousLocation(LOCATION_MZONE) and e:GetHandler():IsReason(REASON_DESTROY)
end
function c13790534.desfilter(c)
	return c:IsType(TYPE_PENDULUM) and c:IsDestructable()
end
function c13790534.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return Duel.IsExistingMatchingCard(c13790534.desfilter,tp,LOCATION_SZONE,0,1,c) end
	local sg=Duel.GetMatchingGroup(c13790534.desfilter,tp,LOCATION_SZONE,0,c)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,sg,sg:GetCount(),0,0)
end
function c13790534.desop(e,tp,eg,ep,ev,re,r,rp)
	local sg=Duel.GetMatchingGroup(c13790534.desfilter,tp,LOCATION_SZONE,0,e:GetHandler())
	if Duel.Destroy(sg,REASON_EFFECT)>0 then
		Duel.MoveToField(e:GetHandler(),tp,tp,LOCATION_SZONE,7,POS_FACEUP,true)
		Duel.ChangePosition(e:GetHandler(),POS_FACEUP)
	end
end
--Destroy and Damage
function c13790534.ddfilter(c)
	return c:IsFaceup() and c:IsLevelBelow(7) and c:IsDestructable()
end
function c13790534.ddescon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetOverlayGroup():IsExists(Card.IsType,1,nil,TYPE_XYZ)
end
function c13790534.ddesop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	--multiattack
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_EXTRA_ATTACK)
	e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
	e1:SetValue(2)
	c:RegisterEffect(e1)
	local g=Duel.GetMatchingGroup(c13790534.ddfilter,tp,0,LOCATION_MZONE,nil)
	local des=Duel.Destroy(g,REASON_EFFECT)
	if des>0 then
		Duel.Damage(1-tp,des*1000,REASON_EFFECT)
	end
end
