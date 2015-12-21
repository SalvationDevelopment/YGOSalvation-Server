--ルーンアイズ・ペンデュラム・ドラゴン
function c80100245.initial_effect(c)
	--fusion material
	c:EnableReviveLimit()
	aux.AddFusionProcCodeFun(c,16178681,aux.FilterBoolFunction(Card.IsRace,RACE_SPELLCASTER),1,true,true)
	--atk
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e1:SetCode(EVENT_SPSUMMON_SUCCESS)
	e1:SetOperation(c80100245.atkop)
	c:RegisterEffect(e1)
end
function c80100245.atkop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local g=c:GetMaterial()
	local tc=g:GetFirst()
	local bool
	while tc do
		if not tc:IsCode(16178681) then 
			local val
			if tc:IsLevelBelow(4) then
				val=1
			else
				val=2
			end
			Debug.ShowHint(val)
			local e1=Effect.CreateEffect(c)
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetCode(EFFECT_EXTRA_ATTACK)
			e1:SetValue(val)
			e1:SetReset(RESET_EVENT+0x1ff0000)
			c:RegisterEffect(e1)
			local e2=e1:Clone()
			e2:SetCode(EFFECT_CANNOT_DIRECT_ATTACK)
			e2:SetCondition(c80100245.dircon)
			c:RegisterEffect(e2)
			local e3=e1:Clone()
			e3:SetCode(EFFECT_CANNOT_ATTACK)
			e3:SetCondition(c80100245.atkcon)
			c:RegisterEffect(e3)
		end
		if not bool and tc:GetSummonType()==SUMMON_TYPE_PENDULUM and c:GetSummonType()==SUMMON_TYPE_FUSION then	
			--immune
			local e5=Effect.CreateEffect(c)
			e5:SetType(EFFECT_TYPE_SINGLE)
			e5:SetCode(EFFECT_IMMUNE_EFFECT)
			e5:SetReset(RESET_EVENT+0x1ff0000+RESET_PHASE+PHASE_END)
			e5:SetValue(c80100245.efilter)
			c:RegisterEffect(e5)
			bool=true
		end
	
		tc=g:GetNext()
	end
end
function c80100245.dircon(e)
	return e:GetHandler():GetAttackAnnouncedCount()>0
end
function c80100245.atkcon(e)
	return e:GetHandler():IsDirectAttacked()
end
function c80100245.efilter(e,re)
	return e:GetHandlerPlayer()~=re:GetHandlerPlayer()
end