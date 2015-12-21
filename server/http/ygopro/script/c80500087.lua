--Angel of Zera
function c80500087.initial_effect(c)
	--synchro summon
	aux.AddSynchroProcedure(c,nil,aux.NonTuner(nil),1)
	c:EnableReviveLimit()
	--Atk up
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_UPDATE_ATTACK)
	e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetValue(c80500087.atkval)
	c:RegisterEffect(e1)
	--Banished
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_REMOVE)
	e2:SetOperation(c80500087.regop)
	c:RegisterEffect(e2)
	--Special Summon
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e3:SetCode(EVENT_PHASE+PHASE_STANDBY)
	e3:SetRange(LOCATION_REMOVED)
	e3:SetLabelObject(e2)
	e3:SetCondition(c80500087.spcon)
	e3:SetCost(c80500087.spcost)
	e3:SetTarget(c80500087.sptg)
	e3:SetOperation(c80500087.spop)
	c:RegisterEffect(e3)
end
function c80500087.atkval(e,c)
	return Duel.GetFieldGroupCount(c:GetControler(),0,LOCATION_REMOVED)*100
end
function c80500087.regop(e,tp,eg,ep,ev,re,r,rp)
	e:SetLabel(Duel.GetTurnCount())
	if Duel.GetCurrentPhase()<=PHASE_STANDBY then
		e:GetHandler():RegisterFlagEffect(80500087,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_STANDBY,0,2)
	else
		e:GetHandler():RegisterFlagEffect(80500087,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_STANDBY,0,1)
	end
end
function c80500087.spcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetLabelObject():GetLabel()~=Duel.GetTurnCount() and
	e:GetHandler():GetFlagEffect(80500087)~=0 and
	e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80500087.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80500087)==0 end
	Duel.RegisterFlagEffect(tp,80500087,RESET_PHASE+PHASE_END,0,1)
end
function c80500087.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end

function c80500087.spop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) then
		Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP)
	end
end