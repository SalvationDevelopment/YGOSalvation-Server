--メタファイズ・ホルス・ドラゴン
function c80100249.initial_effect(c)
	--synchro summon
	aux.AddSynchroProcedure(c,nil,aux.NonTuner(nil),1)
	c:EnableReviveLimit()
	--mat check
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_MATERIAL_CHECK)
	e1:SetValue(c80100249.valcheck)
	c:RegisterEffect(e1)	
	--
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_DELAY)
	e2:SetCode(EVENT_SPSUMMON_SUCCESS)
	e2:SetCondition(c80100249.con)
	e2:SetOperation(c80100249.op)
	c:RegisterEffect(e2)
	e2:SetLabelObject(e1)
end
function c80100249.con(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetSummonType()==SUMMON_TYPE_SYNCHRO
	and e:GetLabelObject():GetLabel()~=0
end
function c80100249.valcheck(e,c)
	local g=c:GetMaterial()
	local typ=0
	local tc=g:GetFirst()
	while tc do
		if not tc:IsType(TYPE_TUNER) then
			 typ=bit.bor(typ,tc:GetType())
		end
		tc=g:GetNext()
	end
	typ=bit.band(typ,TYPE_NORMAL+TYPE_EFFECT+TYPE_PENDULUM)
	e:SetLabel(typ)
end
function c80100249.filter(c)
	return c:IsFaceup() and not c:IsDisabled()
end
function c80100249.target(e,tp,eg,ep,ev,re,r,rp,chkc)
	local typ=e:GetLabelObject():GetLabel() 
	if chk==0 then return typ ~= 0 end
	if bit.band(typ,TYPE_EFFECT)~=0 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
		Duel.SelectTarget(tp,c80100249.filter,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,1,e:GetHandler())
	end
	if bit.band(typ,TYPE_PENDULUM)~=0 then
		Duel.SetOperationInfo(0,CATEGORY_CONTROL,nil,0,0,0)
	end
end
function c80100249.op(e,tp,eg,ep,ev,re,r,rp)
	local typ=e:GetLabelObject():GetLabel()
	local c=e:GetHandler()
	if bit.band(typ,TYPE_NORMAL)~=0 then
		local e3=Effect.CreateEffect(c)
		e3:SetType(EFFECT_TYPE_SINGLE)
		e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
		e3:SetRange(LOCATION_MZONE)
		e3:SetCode(EFFECT_IMMUNE_EFFECT)
		e3:SetValue(1)
		e3:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		c:RegisterEffect(e3)
	end
	if bit.band(typ,TYPE_EFFECT)~=0  then
		local tc=Duel.GetFirstTarget()
		if tc:IsRelateToEffect(e) and not tc:IsDisabled() then
			Duel.NegateRelatedChain(tc,RESET_TURN_SET)
			local e1=Effect.CreateEffect(c)
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetCode(EFFECT_DISABLE)
			e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
			tc:RegisterEffect(e1)
			local e2=Effect.CreateEffect(c)
			e2:SetType(EFFECT_TYPE_SINGLE)
			e2:SetCode(EFFECT_DISABLE_EFFECT)
			e2:SetValue(RESET_TURN_SET)
			e2:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
			tc:RegisterEffect(e2)
		end
	end
	if bit.band(typ,TYPE_PENDULUM)~=0  then
		Duel.Hint(HINT_SELECTMSG,1-tp,HINTMSG_CONTROL)
		local cg=Duel.SelectMatchingCard(1-tp,Card.IsAbleToChangeControler,1-tp,LOCATION_MZONE,0,1,1,nil)
		if cg:GetCount()>0 then
			Duel.GetControl(cg:GetFirst(),tp)
			local e3=Effect.CreateEffect(e:GetHandler())
			e3:SetType(EFFECT_TYPE_SINGLE)
			e3:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_OATH)
			e3:SetCode(EFFECT_CANNOT_ATTACK_ANNOUNCE)
			e3:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
			cg:GetFirst():RegisterEffect(e3)
		end
	end
end