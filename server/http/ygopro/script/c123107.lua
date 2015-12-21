--Mirror Knight Calling
function c123107.initial_effect(c)
	c:EnableReviveLimit()
	--Summon
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(123107,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_TRIGGER_F+EFFECT_TYPE_SINGLE)
	e1:SetCode(EVENT_SPSUMMON_SUCCESS)
	e1:SetTarget(c123107.target)
	e1:SetOperation(c123107.activate)
	c:RegisterEffect(e1)
	--defence up
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DEFCHANGE)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCode(EVENT_PRE_DAMAGE_CALCULATE)
	e2:SetOperation(c123107.defop)
	c:RegisterEffect(e2)
	--add counter
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(123107,0))
	e3:SetCategory(CATEGORY_COUNTER)
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCode(EVENT_FREE_CHAIN)
	e3:SetProperty(EFFECT_FLAG_REPEAT)
	e3:SetCountLimit(1)
	e3:SetOperation(c123107.operation)
	c:RegisterEffect(e3)
end

function c123107.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanSpecialSummonMonster(tp,123131,0,0x4011,0,0,1,RACE_WARRIOR,ATTRIBUTE_DARK) end
	local ft=Duel.GetLocationCount(tp,LOCATION_MZONE)
	Duel.SetOperationInfo(0,CATEGORY_TOKEN,nil,ft,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,ft,0,0)
end
function c123107.activate(e,tp,eg,ep,ev,re,r,rp)
	local ft=Duel.GetLocationCount(tp,LOCATION_MZONE)
	if ft==0 or not Duel.IsPlayerCanSpecialSummonMonster(tp,123131,0,0x4011,0,0,1,RACE_WARRIOR,ATTRIBUTE_DARK) then return end
	for i=1,ft do
		local token=Duel.CreateToken(tp,123131)
		Duel.SpecialSummonStep(token,0,tp,tp,false,false,POS_FACEUP_ATTACK)
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_DESTROY_REPLACE)
		e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
		e1:SetRange(LOCATION_MZONE)
		e1:SetTarget(c123107.desreptg)
		e1:SetOperation(c123107.desrepop)
		token:RegisterEffect(e1,true)
		local e2=Effect.CreateEffect(e:GetHandler())
		e2:SetCategory(CATEGORY_ATKCHANGE)
		e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
		e2:SetRange(LOCATION_MZONE)
		e2:SetCode(EVENT_PRE_DAMAGE_CALCULATE)
		e2:SetOperation(c123107.atkop)
		token:RegisterEffect(e2,true)
		local e3=Effect.CreateEffect(e:GetHandler())
		e3:SetType(EFFECT_TYPE_SINGLE)
		e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
		e3:SetCode(EFFECT_COUNTER_LIMIT+0x53)
		e3:SetRange(LOCATION_MZONE)
		e3:SetValue(1)
		token:RegisterEffect(e3,true)
	end
	Duel.SpecialSummonComplete()
end

function c123107.atkop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tg=c:GetBattleTarget()
	if tg then
		local atk=tg:GetAttack()
		if atk>0 then
			local e1=Effect.CreateEffect(c)
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetCode(EFFECT_UPDATE_ATTACK)
			e1:SetReset(RESET_PHASE+RESET_DAMAGE_CAL)
			e1:SetValue(atk)
			c:RegisterEffect(e1)
		end
	end
end

function c123107.desreptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return not e:GetHandler():IsReason(REASON_RULE)
		and e:GetHandler():GetCounter(0x53)>0 end
	return true
end
function c123107.desrepop(e,tp,eg,ep,ev,re,r,rp)
	e:GetHandler():RemoveCounter(ep,0x53,1,REASON_EFFECT)
end

function c123107.operation(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local g=Duel.GetMatchingGroup(c123107.tgfilter,tp,LOCATION_MZONE,0,nil)
	local tc=g:GetFirst()
	while tc do
		tc:AddCounter(0x53,1) 
		tc=g:GetNext()
	end
end

function c123107.tgfilter(c)
	return c:IsCode(123131) 
end

function c123107.defop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tg=c:GetBattleTarget()
	if tg then
		local def=tg:GetAttack()
		if def>0 then
			local e1=Effect.CreateEffect(c)
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetCode(EFFECT_UPDATE_DEFENCE)
			e1:SetReset(RESET_PHASE+RESET_DAMAGE_CAL)
			e1:SetValue(def)
			c:RegisterEffect(e1)
		end
	end
end