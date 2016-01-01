--PSYFrame Circuit
function c575512.initial_effect(c)
--Activate
        local e1=Effect.CreateEffect(c)
        e1:SetType(EFFECT_TYPE_ACTIVATE)
        e1:SetCode(EVENT_FREE_CHAIN)
        c:RegisterEffect(e1)
--spsummon
        local e2=Effect.CreateEffect(c)
		e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
		e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
		e2:SetProperty(EFFECT_FLAG_DELAY)
		e2:SetCode(EVENT_SPSUMMON_SUCCESS)
		e2:SetRange(LOCATION_FZONE)
		e2:SetCondition(c575512.sccon)
		e2:SetTarget(c575512.sctg)
		e2:SetOperation(c575512.scop)
		c:RegisterEffect(e2)
--remove
		local e3=Effect.CreateEffect(c)
		e3:SetCategory(CATEGORY_ATKCHANGE)
		e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
		e3:SetCode(EVENT_BATTLE_START)
		e3:SetRange(LOCATION_FZONE)
		e3:SetCondition(c575512.condition2)
		e3:SetCost(c575512.cost2)
		e3:SetOperation(c575512.operation2)
		c:RegisterEffect(e3)
end
function c575512.psyfilter(c,tp)
	return c:IsFaceup() and c:IsSetCard(0xd3) and c:IsControler(tp)
end
function c575512.sccon(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c575512.psyfilter,1,nil,tp)
end
function c575512.mfilter(c)
	return c:IsSetCard(0xd3)
end
function c575512.sfilter(c,syn)
	return syn:IsSynchroSummonable(c)
end
function c575512.spfilter(c,mg)
	return mg:IsExists(c575512.sfilter,1,nil,c)
end
function c575512.filter(c)
	return c:IsSetCard(0xd3) and c:IsAbleToGraveAsCost() and c:IsType(TYPE_MONSTER)
end
function c575512.sctg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then
		local mg=Duel.GetMatchingGroup(c575512.mfilter,tp,LOCATION_MZONE,0,nil)
		return Duel.IsExistingMatchingCard(c575512.spfilter,tp,LOCATION_EXTRA,0,1,nil,mg)
	end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end
function c575512.scop(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local mg=Duel.GetMatchingGroup(c575512.mfilter,tp,LOCATION_MZONE,0,nil)
	local g=Duel.GetMatchingGroup(c575512.spfilter,tp,LOCATION_EXTRA,0,nil,mg)
	if g:GetCount()>0 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local sg=g:Select(tp,1,1,nil)
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SMATERIAL)
		local tg=mg:FilterSelect(tp,c575512.psyfilter,1,1,nil,sg:GetFirst())
		Duel.SynchroSummon(tp,sg:GetFirst(),tg:GetFirst())
	end
end
function c575512.condition2(e,tp,eg,ep,ev,re,r,rp)
	local c=Duel.GetAttackTarget()
	if not c then return false end
	if c:IsControler(1-tp) then c=Duel.GetAttacker() end
	e:SetLabelObject(c)
	return c and c:IsSetCard(0xd3) and c:IsRelateToBattle()
end
function c575512.cost2(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c575512.filter,tp,LOCATION_HAND,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,c575512.filter,tp,LOCATION_HAND,0,1,1,nil,tp)
	local atk=g:GetFirst():GetAttack()
	e:SetLabel(atk)
	Duel.SendtoGrave(g,REASON_COST+REASON_DISCARD)
end
function c575512.operation2(e,tp,eg,ep,ev,re,r,rp,chk)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local c=e:GetLabelObject()
	local atk=e:GetLabel()
	if c:IsFaceup() and c:IsRelateToBattle() then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		e1:SetValue(atk)
		c:RegisterEffect(e1)
	end
end